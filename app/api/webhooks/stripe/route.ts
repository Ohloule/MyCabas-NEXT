import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { eurosToCents, distributeProportionally } from "@/lib/money";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Gère les événements Stripe (webhook).
 * IMPORTANT : cette route ne doit PAS utiliser auth() — Stripe envoie les requêtes directement.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
        await handleAuthorized(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handleFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.succeeded":
        await handleCaptured(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handleCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      default:
        // Événement non géré — on acknowledge quand même
        break;
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err);
    // On retourne 200 quand même pour éviter les retries Stripe
    // L'erreur est loguée pour investigation
  }

  return NextResponse.json({ received: true });
}

/**
 * Paiement pré-autorisé avec succès.
 * Crée la commande réelle + le Payment depuis la CheckoutSession.
 */
async function handleAuthorized(paymentIntent: Stripe.PaymentIntent) {
  // Idempotent : si un Payment existe déjà pour ce PI, on ne recrée rien
  const existingPayment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
  if (existingPayment) return;

  // Récupérer la CheckoutSession
  const checkoutSession = await prisma.checkoutSession.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!checkoutSession) {
    console.error(
      `No CheckoutSession found for PaymentIntent ${paymentIntent.id}`
    );
    return;
  }

  const items = checkoutSession.items as {
    productId: string;
    productName: string;
    productUnit: string;
    productImageUrl: string | null;
    unitPriceEuros: number;
    quantity: number;
    totalEuros: number;
    vendorId: string;
  }[];

  // Créer Order + Payment dans une transaction
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: checkoutSession.orderNumber,
        userId: checkoutSession.userId,
        marketId: checkoutSession.marketId,
        marketDay: checkoutSession.marketDay,
        marketDate: checkoutSession.marketDate,
        subtotalEuros: checkoutSession.subtotalEuros,
        totalEuros: checkoutSession.totalEuros,
        commissionsByVendor: checkoutSession.commissionsByVendor!,
        captureDeadline: checkoutSession.captureDeadline,
        status: "AUTHORIZED",
        items: {
          create: items.map((item) => ({
            productName: item.productName,
            productUnit: item.productUnit,
            productImageUrl: item.productImageUrl,
            unitPriceEuros: item.unitPriceEuros,
            quantity: item.quantity,
            totalEuros: item.totalEuros,
            productId: item.productId,
            vendorId: item.vendorId,
          })),
        },
      },
    });

    await tx.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        amountCents: checkoutSession.amountCents,
        applicationFeeCents: checkoutSession.applicationFeeCents,
        status: "AUTHORIZED",
        authorizedAt: new Date(),
        orderId: order.id,
      },
    });

    // Supprimer la CheckoutSession (plus nécessaire)
    await tx.checkoutSession.delete({
      where: { id: checkoutSession.id },
    });
  });
}

/**
 * Paiement échoué — nettoyer la CheckoutSession si pas encore de commande.
 */
async function handleFailed(paymentIntent: Stripe.PaymentIntent) {
  // Cas 1 : Order déjà créée (paiement échoué après autorisation)
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (payment) {
    if (payment.status === "FAILED") return; // Idempotent
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failedAt: new Date() },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      }),
    ]);
    return;
  }

  // Cas 2 : Pas de commande, juste nettoyer la CheckoutSession
  await prisma.checkoutSession.deleteMany({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
}

/**
 * Paiement capturé — créer les Transfers vers les vendors Connect.
 */
async function handleCaptured(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: {
      order: {
        include: {
          items: {
            include: {
              vendor: {
                select: {
                  id: true,
                  stripeConnectAccountId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment || payment.status === "CAPTURED") return; // Idempotent

  const order = payment.order;
  const commissions = order.commissionsByVendor as Record<string, number>;

  // Récupérer les frais Stripe réels via la balance_transaction
  const chargeId =
    typeof paymentIntent.latest_charge === "string"
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge?.id;

  let stripeFeeCents = 0;

  if (chargeId) {
    try {
      const charge = await stripe.charges.retrieve(chargeId, {
        expand: ["balance_transaction"],
      });
      const balanceTransaction =
        charge.balance_transaction as Stripe.BalanceTransaction;
      if (balanceTransaction && typeof balanceTransaction.fee === "number") {
        stripeFeeCents = balanceTransaction.fee;
      }
    } catch (err) {
      console.error(
        `Failed to retrieve Stripe fee for charge ${chargeId}:`,
        err
      );
      // Fallback : MyCabas absorbe les frais si on ne peut pas les récupérer
    }
  }

  // Calculer le montant à transférer à chaque vendor
  const vendorTotals = new Map<string, { total: number; stripeAccountId: string }>();

  for (const item of order.items) {
    const itemTotal = item.adjustedTotalEuros ?? item.totalEuros;
    const current = vendorTotals.get(item.vendorId);

    if (current) {
      current.total += itemTotal;
    } else {
      vendorTotals.set(item.vendorId, {
        total: itemTotal,
        stripeAccountId: item.vendor.stripeConnectAccountId!,
      });
    }
  }

  // Répartir les frais Stripe proportionnellement entre les vendors
  const vendorShares = Array.from(vendorTotals.entries()).map(
    ([vendorId, { total }]) => ({ key: vendorId, amount: total })
  );
  const feeDistribution = distributeProportionally(vendorShares, stripeFeeCents);

  // Créer les transfers vers chaque vendor — best-effort, ne bloque pas le status update
  for (const [vendorId, { total, stripeAccountId }] of vendorTotals) {
    const commission = commissions[vendorId] || 0;
    const proportionalFeeCents = feeDistribution.get(vendorId) || 0;
    const proportionalFeeEuros = proportionalFeeCents / 100;

    const transferAmountEuros = total - commission - proportionalFeeEuros;
    const transferAmountCents = Math.max(0, eurosToCents(transferAmountEuros));

    if (transferAmountCents > 0 && stripeAccountId) {
      try {
        await stripe.transfers.create({
          amount: transferAmountCents,
          currency: "eur",
          destination: stripeAccountId,
          transfer_group: order.id,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            vendorId,
            commissionEuros: commission.toString(),
            stripeFeeEuros: proportionalFeeEuros.toString(),
          },
        });
      } catch (err) {
        console.error(
          `Transfer failed for vendor ${vendorId} on order ${order.orderNumber}:`,
          err
        );
      }
    }
  }

  // Mettre à jour les statuts + stocker les frais Stripe
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        capturedAt: new Date(),
        stripeFeeCents,
        stripeFeeByVendor: Object.fromEntries(feeDistribution),
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CAPTURED",
        capturedAt: new Date(),
      },
    }),
  ]);
}

/**
 * PaymentIntent annulé (autorisation expirée ou annulation manuelle).
 */
async function handleCanceled(paymentIntent: Stripe.PaymentIntent) {
  // Cas 1 : Order existe
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (payment) {
    if (payment.status === "CANCELLED") return; // Idempotent
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "EXPIRED", cancelledAt: new Date() },
      }),
    ]);
    return;
  }

  // Cas 2 : Pas de commande, nettoyer la CheckoutSession
  await prisma.checkoutSession.deleteMany({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
}

/**
 * Mise à jour d'un compte Connect (onboarding terminé, etc.)
 */
async function handleAccountUpdated(account: Stripe.Account) {
  if (!account.id) return;

  const vendor = await prisma.vendor.findUnique({
    where: { stripeConnectAccountId: account.id },
  });

  if (!vendor) return;

  const isComplete = account.charges_enabled && account.details_submitted;

  if (isComplete !== vendor.stripeOnboardingComplete) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { stripeOnboardingComplete: isComplete },
    });
  }
}

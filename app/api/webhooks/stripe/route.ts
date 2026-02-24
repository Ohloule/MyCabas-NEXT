import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { eurosToCents } from "@/lib/money";
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
 */
async function handleAuthorized(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: { order: true },
  });

  if (!payment || payment.status !== "PENDING") return; // Idempotent

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "AUTHORIZED",
        authorizedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "AUTHORIZED" },
    }),
  ]);
}

/**
 * Paiement échoué.
 */
async function handleFailed(paymentIntent: Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!payment || payment.status === "FAILED") return; // Idempotent

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        failedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    }),
  ]);
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

  // Créer les transfers vers chaque vendor — best-effort, ne bloque pas le status update
  for (const [vendorId, { total, stripeAccountId }] of vendorTotals) {
    const commission = commissions[vendorId] || 0;
    const transferAmountEuros = total - commission;
    const transferAmountCents = eurosToCents(transferAmountEuros);

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

  // Mettre à jour les statuts
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CAPTURED",
        capturedAt: new Date(),
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
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!payment || payment.status === "CANCELLED") return; // Idempotent

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: "EXPIRED",
        cancelledAt: new Date(),
      },
    }),
  ]);
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

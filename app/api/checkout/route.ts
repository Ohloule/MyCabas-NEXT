import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { eurosToCents, resolvePrice, calculateCommission } from "@/lib/money";
import {
  getNextMarketDate,
  buildCaptureDeadline,
  isWithinAuthWindow,
} from "@/lib/market-schedule";
import { NextResponse } from "next/server";

/**
 * Génère un numéro de commande unique : MYC-YYYYMMDD-XXXX
 */
async function generateOrderNumber(marketDate: Date): Promise<string> {
  const dateStr = marketDate.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `MYC-${dateStr}-`;

  // Compter les commandes existantes pour cette date de marché
  const count = await prisma.order.count({
    where: {
      orderNumber: { startsWith: prefix },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

/**
 * POST /api/checkout
 * Crée une commande à partir du panier et un PaymentIntent Stripe (capture manuelle).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 1. Charger le panier complet
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      market: {
        include: {
          openings: true,
        },
      },
      items: {
        include: {
          product: {
            include: {
              vendor: {
                select: {
                  id: true,
                  stallName: true,
                  stripeConnectAccountId: true,
                  stripeOnboardingComplete: true,
                },
              },
              pricesByMarket: true,
              stocksByMarket: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Panier vide" }, { status: 400 });
  }

  if (!cart.market || !cart.marketId) {
    return NextResponse.json(
      { error: "Aucun marché associé au panier" },
      { status: 400 }
    );
  }

  // 2. Vérifier que tous les vendors sont onboardés sur Stripe
  const vendors = new Map<
    string,
    {
      id: string;
      stallName: string;
      stripeConnectAccountId: string | null;
      stripeOnboardingComplete: boolean;
    }
  >();

  for (const item of cart.items) {
    vendors.set(item.product.vendor.id, item.product.vendor);
  }

  for (const [, vendor] of vendors) {
    if (!vendor.stripeOnboardingComplete || !vendor.stripeConnectAccountId) {
      return NextResponse.json(
        {
          error: `Le commerçant "${vendor.stallName}" n'a pas encore configuré ses paiements en ligne. Impossible de passer commande pour le moment.`,
        },
        { status: 400 }
      );
    }
  }

  // 3. Déterminer le prochain jour de marché
  const openings = cart.market.openings;
  if (openings.length === 0) {
    return NextResponse.json(
      { error: "Ce marché n'a pas d'horaires d'ouverture configurés" },
      { status: 400 }
    );
  }

  // Trouver la prochaine ouverture (la plus proche)
  let nextOpening = null;
  let nextDate: Date | null = null;

  for (const opening of openings) {
    const date = getNextMarketDate(opening.day, opening.start);
    if (!nextDate || date < nextDate) {
      nextDate = date;
      nextOpening = opening;
    }
  }

  if (!nextDate || !nextOpening) {
    return NextResponse.json(
      { error: "Impossible de déterminer la prochaine date de marché" },
      { status: 500 }
    );
  }

  // 4. Vérifier la fenêtre d'autorisation Stripe (max 6 jours)
  if (!isWithinAuthWindow(nextDate)) {
    return NextResponse.json(
      {
        error:
          "Le prochain marché est dans plus de 6 jours. Les commandes ne peuvent être passées qu'une semaine avant le marché.",
      },
      { status: 400 }
    );
  }

  const captureDeadline = buildCaptureDeadline(nextDate, nextOpening.start);

  // 5. Résoudre les prix et valider les stocks
  const orderItems: {
    productId: string;
    productName: string;
    productUnit: string;
    productImageUrl: string | null;
    unitPriceEuros: number;
    quantity: number;
    totalEuros: number;
    vendorId: string;
  }[] = [];

  for (const item of cart.items) {
    const product = item.product;

    // Résoudre le prix pour ce marché
    const unitPrice = resolvePrice(
      product.basePrice,
      product.pricesByMarket,
      cart.marketId!
    );

    // Vérifier le stock
    const stock = product.stocksByMarket.find(
      (s) => s.marketId === cart.marketId
    );
    if (stock && !stock.isUnlimited && stock.quantity !== null) {
      if (item.quantity > stock.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour "${product.name}". Disponible : ${stock.quantity} ${product.unit}`,
          },
          { status: 400 }
        );
      }
    }

    const lineTotal = parseFloat((unitPrice * item.quantity).toFixed(2));

    orderItems.push({
      productId: product.id,
      productName: product.name,
      productUnit: product.unit,
      productImageUrl: product.imageUrl,
      unitPriceEuros: unitPrice,
      quantity: item.quantity,
      totalEuros: lineTotal,
      vendorId: product.vendor.id,
    });
  }

  // 6. Calculer les sous-totaux par vendor et les commissions
  const vendorSubtotals = new Map<string, number>();
  for (const item of orderItems) {
    const current = vendorSubtotals.get(item.vendorId) || 0;
    vendorSubtotals.set(item.vendorId, current + item.totalEuros);
  }

  const commissionsByVendor: Record<string, number> = {};
  let totalCommissionEuros = 0;

  for (const [vendorId, subtotal] of vendorSubtotals) {
    // Récupérer la commission déjà collectée pour ce vendor/marché/date
    const existingOrders = await prisma.order.findMany({
      where: {
        marketId: cart.marketId!,
        marketDate: nextDate,
        status: {
          in: [
            "AUTHORIZED",
            "CONFIRMED",
            "ADJUSTED",
            "CAPTURED",
            "PICKED_UP",
          ],
        },
      },
      select: { commissionsByVendor: true },
    });

    let alreadyCollected = 0;
    for (const order of existingOrders) {
      const commissions = order.commissionsByVendor as Record<string, number>;
      if (commissions[vendorId]) {
        alreadyCollected += commissions[vendorId];
      }
    }

    const commission = calculateCommission(subtotal, alreadyCollected);
    commissionsByVendor[vendorId] = commission;
    totalCommissionEuros += commission;
  }

  const subtotalEuros = parseFloat(
    orderItems.reduce((sum, item) => sum + item.totalEuros, 0).toFixed(2)
  );
  const totalEuros = subtotalEuros; // Le client paie le subtotal, la commission est déduite du payout vendor

  // 7. Vérifier que le montant est valide
  const amountCents = eurosToCents(totalEuros);
  if (amountCents < 50) {
    // Minimum Stripe : 0.50€
    return NextResponse.json(
      { error: "Le montant minimum de commande est de 0,50 €" },
      { status: 400 }
    );
  }

  const applicationFeeCents = eurosToCents(totalCommissionEuros);

  // 8. Créer la commande et le PaymentIntent dans une transaction
  const result = await prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(nextDate);

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        marketId: cart.marketId!,
        marketDay: nextOpening.day,
        marketDate: nextDate,
        subtotalEuros,
        totalEuros,
        commissionsByVendor,
        captureDeadline,
        items: {
          create: orderItems.map((item) => ({
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

    // Créer le PaymentIntent Stripe (capture manuelle)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      capture_method: "manual",
      // Application fee = commission MyCabas (prélevée au moment du transfer)
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: session.user.id,
        marketId: cart.marketId!,
        applicationFeeCents: applicationFeeCents.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Créer le Payment en DB
    await tx.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        amountCents,
        applicationFeeCents,
        orderId: order.id,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: paymentIntent.client_secret,
      totalEuros,
      subtotalEuros,
    };
  });

  return NextResponse.json(result);
}

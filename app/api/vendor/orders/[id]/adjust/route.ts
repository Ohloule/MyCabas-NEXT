import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { eurosToCents, calculateCommission } from "@/lib/money";
import { NextRequest, NextResponse } from "next/server";

interface AdjustItem {
  orderItemId: string;
  newQuantity: number;
}

/**
 * POST /api/vendor/orders/[id]/adjust
 * Le vendor ajuste les quantités de sa partie de la commande.
 * Body: { items: [{ orderItemId, newQuantity }], note?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { items, note } = body as {
    items: AdjustItem[];
    note?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Aucun item à ajuster" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Commande non trouvée" },
      { status: 404 }
    );
  }

  if (order.status !== "AUTHORIZED" && order.status !== "ADJUSTED") {
    return NextResponse.json(
      { error: `Impossible d'ajuster une commande en statut "${order.status}"` },
      { status: 400 }
    );
  }

  // Vérifier que les items appartiennent à ce vendor
  const vendorItems = order.items.filter(
    (item) => item.vendorId === session.user.vendorId
  );
  const vendorItemIds = new Set(vendorItems.map((item) => item.id));

  for (const adj of items) {
    if (!vendorItemIds.has(adj.orderItemId)) {
      return NextResponse.json(
        { error: `Item ${adj.orderItemId} ne vous appartient pas` },
        { status: 403 }
      );
    }
    if (adj.newQuantity < 0) {
      return NextResponse.json(
        { error: "La quantité ne peut pas être négative" },
        { status: 400 }
      );
    }
  }

  // Appliquer les ajustements dans une transaction
  await prisma.$transaction(async (tx) => {
    // Mettre à jour chaque item ajusté
    for (const adj of items) {
      const originalItem = order.items.find((i) => i.id === adj.orderItemId)!;
      const adjustedTotal = parseFloat(
        (originalItem.unitPriceEuros * adj.newQuantity).toFixed(2)
      );

      await tx.orderItem.update({
        where: { id: adj.orderItemId },
        data: {
          adjustedQuantity: adj.newQuantity,
          adjustedTotalEuros: adjustedTotal,
        },
      });
    }

    // Recalculer le total de la commande
    const allItems = await tx.orderItem.findMany({
      where: { orderId: order.id },
    });

    let newSubtotal = 0;
    for (const item of allItems) {
      newSubtotal += item.adjustedTotalEuros ?? item.totalEuros;
    }
    newSubtotal = parseFloat(newSubtotal.toFixed(2));

    // Recalculer les commissions par vendor
    const vendorSubtotals = new Map<string, number>();
    for (const item of allItems) {
      const itemTotal = item.adjustedTotalEuros ?? item.totalEuros;
      const current = vendorSubtotals.get(item.vendorId) || 0;
      vendorSubtotals.set(item.vendorId, current + itemTotal);
    }

    const newCommissions: Record<string, number> = {};
    let totalCommission = 0;

    for (const [vendorId, subtotal] of vendorSubtotals) {
      // Récupérer la commission déjà collectée pour les AUTRES commandes
      const otherOrders = await tx.order.findMany({
        where: {
          marketId: order.marketId,
          marketDate: order.marketDate,
          id: { not: order.id }, // Exclure cette commande
          status: {
            in: ["AUTHORIZED", "CONFIRMED", "ADJUSTED", "CAPTURED", "PICKED_UP"],
          },
        },
        select: { commissionsByVendor: true },
      });

      let alreadyCollected = 0;
      for (const o of otherOrders) {
        const comms = o.commissionsByVendor as Record<string, number>;
        if (comms[vendorId]) {
          alreadyCollected += comms[vendorId];
        }
      }

      const commission = calculateCommission(subtotal, alreadyCollected);
      newCommissions[vendorId] = commission;
      totalCommission += commission;
    }

    // Mettre à jour la commande
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "ADJUSTED",
        adjustedSubtotalEuros: newSubtotal,
        adjustedTotalEuros: newSubtotal,
        commissionsByVendor: newCommissions,
        vendorNote: note || undefined,
      },
    });

    // Mettre à jour le PaymentIntent Stripe avec le nouveau montant
    if (order.payment) {
      const newAmountCents = eurosToCents(newSubtotal);
      const newFeeCents = eurosToCents(totalCommission);

      await stripe.paymentIntents.update(order.payment.stripePaymentIntentId, {
        amount: newAmountCents,
        metadata: {
          applicationFeeCents: newFeeCents.toString(),
          adjusted: "true",
        },
      });

      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          amountCents: newAmountCents,
          applicationFeeCents: newFeeCents,
        },
      });
    }
  });

  return NextResponse.json({ success: true });
}

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/vendor/orders/[id]/cancel
 * Le vendor annule la commande. L'autorisation est relâchée.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        where: { vendorId: session.user.vendorId },
      },
      payment: true,
    },
  });

  if (!order || order.items.length === 0) {
    return NextResponse.json(
      { error: "Commande non trouvée" },
      { status: 404 }
    );
  }

  if (!["AUTHORIZED", "CONFIRMED", "ADJUSTED"].includes(order.status)) {
    return NextResponse.json(
      { error: `Impossible d'annuler une commande en statut "${order.status}"` },
      { status: 400 }
    );
  }

  // Annuler le PaymentIntent (relâche l'autorisation)
  if (order.payment) {
    await stripe.paymentIntents.cancel(
      order.payment.stripePaymentIntentId
    );
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    }),
    ...(order.payment
      ? [
          prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ success: true });
}

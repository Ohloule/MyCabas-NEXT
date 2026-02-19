import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/expire-orders
 * Expire les commandes autorisées que le vendor n'a pas confirmées avant la deadline.
 * Appelé toutes les 15 minutes par Vercel Cron.
 */
export async function GET(req: NextRequest) {
  // Vérifier le secret cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  // Trouver les commandes autorisées dont la deadline est passée
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["AUTHORIZED", "ADJUSTED"] },
      captureDeadline: { lte: now },
    },
    include: {
      payment: true,
    },
  });

  let expired = 0;
  let errors = 0;

  for (const order of orders) {
    if (!order.payment) continue;

    try {
      // Annuler le PaymentIntent (relâche l'autorisation)
      await stripe.paymentIntents.cancel(
        order.payment.stripePaymentIntentId
      );

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "EXPIRED",
            cancelledAt: now,
          },
        }),
        prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
          },
        }),
      ]);

      expired++;
    } catch (err) {
      console.error(
        `Failed to expire order ${order.orderNumber}:`,
        err
      );
      errors++;
    }
  }

  return NextResponse.json({
    processed: orders.length,
    expired,
    errors,
  });
}

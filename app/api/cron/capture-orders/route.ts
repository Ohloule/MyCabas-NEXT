import prisma from "@/lib/prisma";
import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cron/capture-orders
 * Capture les commandes confirmées dont la deadline est passée.
 * Appelé toutes les 15 minutes par Vercel Cron.
 */
export async function GET(req: NextRequest) {
  // Vérifier le secret cron
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  // Trouver les commandes confirmées dont la deadline est passée
  const orders = await prisma.order.findMany({
    where: {
      status: "CONFIRMED",
      captureDeadline: { lte: now },
    },
    include: {
      payment: true,
    },
  });

  let captured = 0;
  let errors = 0;

  for (const order of orders) {
    if (!order.payment) continue;

    try {
      // Capturer le PaymentIntent
      await stripe.paymentIntents.capture(
        order.payment.stripePaymentIntentId
      );

      // Les transfers sont gérés par le webhook payment_intent.captured
      captured++;
    } catch (err) {
      console.error(
        `Failed to capture order ${order.orderNumber}:`,
        err
      );
      errors++;
    }
  }

  return NextResponse.json({
    processed: orders.length,
    captured,
    errors,
  });
}

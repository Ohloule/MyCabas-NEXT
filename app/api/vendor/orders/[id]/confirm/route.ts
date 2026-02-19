import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/vendor/orders/[id]/confirm
 * Le vendor confirme la commande telle quelle.
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
    },
  });

  if (!order || order.items.length === 0) {
    return NextResponse.json(
      { error: "Commande non trouvée" },
      { status: 404 }
    );
  }

  if (order.status !== "AUTHORIZED" && order.status !== "ADJUSTED") {
    return NextResponse.json(
      { error: `Impossible de confirmer une commande en statut "${order.status}"` },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id },
    data: {
      status: "CONFIRMED",
      confirmedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}

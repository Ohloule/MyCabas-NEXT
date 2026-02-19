import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/vendor/orders/[id]
 * Détail d'une commande pour le vendor.
 */
export async function GET(
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
      user: {
        select: { firstName: true, lastName: true, phone: true },
      },
      market: {
        select: { name: true, address: true, town: true },
      },
      items: {
        where: { vendorId: session.user.vendorId },
        orderBy: { createdAt: "asc" },
      },
      payment: {
        select: { status: true, amountCents: true },
      },
    },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Commande non trouvée" },
      { status: 404 }
    );
  }

  // Vérifier que le vendor a bien des items dans cette commande
  if (order.items.length === 0) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  return NextResponse.json(order);
}

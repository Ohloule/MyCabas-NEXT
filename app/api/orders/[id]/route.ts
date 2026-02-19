import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/orders/[id]
 * Détail d'une commande pour le client authentifié.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      market: {
        select: { name: true, address: true, town: true },
      },
      items: {
        include: {
          vendor: {
            select: { stallName: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      payment: {
        select: { status: true },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Commande non trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json(order);
}

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/orders
 * Liste les commandes du client authentifié.
 * Query params: ?active=true (commandes en cours) ou ?active=false (commandes terminées)
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const active = searchParams.get("active");

  const activeStatuses = [
    "AUTHORIZED",
    "CONFIRMED",
    "ADJUSTED",
    "CAPTURED",
  ];
  const closedStatuses = ["PICKED_UP", "CANCELLED", "EXPIRED", "REFUNDED"];

  const where: Record<string, unknown> = {
    userId: session.user.id,
  };

  if (active === "true") {
    where.status = { in: activeStatuses };
  } else if (active === "false") {
    where.status = { in: closedStatuses };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      market: {
        select: { name: true, town: true },
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

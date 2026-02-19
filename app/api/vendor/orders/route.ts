import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/vendor/orders
 * Liste les commandes du vendor authentifié.
 * Query params: ?status=AUTHORIZED,CONFIRMED (filtrer par statut, séparés par virgule)
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const statusFilter = searchParams.get("status");

  // Filtrer les commandes qui contiennent des items de ce vendor
  const where: Record<string, unknown> = {
    items: {
      some: { vendorId: session.user.vendorId },
    },
  };

  if (statusFilter) {
    const statuses = statusFilter.split(",").map((s) => s.trim());
    where.status = { in: statuses };
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: {
        select: { firstName: true, lastName: true },
      },
      market: {
        select: { name: true, town: true },
      },
      items: {
        where: { vendorId: session.user.vendorId },
        orderBy: { createdAt: "asc" },
      },
      payment: {
        select: { status: true },
      },
    },
    orderBy: { marketDate: "asc" },
  });

  return NextResponse.json(orders);
}

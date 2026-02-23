import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const [
    pendingMarkets,
    totalMarkets,
    totalVendors,
    totalUsers,
    openConversations,
    totalOrders,
  ] = await Promise.all([
    prisma.market.count({ where: { status: "PENDING" } }),
    prisma.market.count(),
    prisma.vendor.count(),
    prisma.user.count(),
    prisma.conversation.count({ where: { status: "OPEN" } }),
    prisma.order.count(),
  ]);

  return NextResponse.json({
    pendingMarkets,
    totalMarkets,
    totalVendors,
    totalUsers,
    openConversations,
    totalOrders,
  });
}

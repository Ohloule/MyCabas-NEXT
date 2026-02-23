import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const vendors = await prisma.vendor.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      },
      _count: {
        select: { products: true, marketVendors: true, orderItems: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vendors });
}

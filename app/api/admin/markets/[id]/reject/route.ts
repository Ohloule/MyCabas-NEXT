import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason: string = body.reason?.trim() || "";

  const market = await prisma.market.findUnique({ where: { id } });
  if (!market) {
    return NextResponse.json({ error: "Marché introuvable" }, { status: 404 });
  }

  const updated = await prisma.market.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason || null },
  });

  return NextResponse.json({ market: updated });
}

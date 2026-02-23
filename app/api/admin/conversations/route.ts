import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // OPEN | CLOSED | null = tous

  const conversations = await prisma.conversation.findMany({
    where: status ? { status: status as "OPEN" | "CLOSED" } : undefined,
    include: {
      vendor: {
        select: {
          id: true,
          stallName: true,
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
      _count: {
        select: {
          messages: {
            where: { readAt: null, senderId: { not: session.user.id } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

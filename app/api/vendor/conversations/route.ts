import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — liste des conversations du vendor
export async function GET() {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { vendorId: session.user.vendorId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
      _count: {
        select: {
          messages: {
            where: { readAt: null, sender: { role: "ADMIN" } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ conversations });
}

// POST — créer une nouvelle conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const subject: string = body.subject?.trim() || "";
  const content: string = body.content?.trim() || "";

  if (!subject || !content) {
    return NextResponse.json(
      { error: "Objet et message requis" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.create({
    data: {
      subject,
      vendorId: session.user.vendorId,
      messages: {
        create: {
          content,
          senderId: session.user.id,
        },
      },
    },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
      },
    },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — détail d'une conversation + messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id, vendorId: session.user.vendorId },
    include: {
      messages: {
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
  }

  // Marquer les messages admin comme lus
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      readAt: null,
      sender: { role: "ADMIN" },
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ conversation });
}

// POST — envoyer un message dans la conversation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.vendorId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const content: string = body.content?.trim() || "";

  if (!content) {
    return NextResponse.json({ error: "Message vide" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id, vendorId: session.user.vendorId },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
  }
  if (conversation.status === "CLOSED") {
    return NextResponse.json(
      { error: "Cette conversation a été clôturée par l'équipe MyCabas" },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      conversationId: id,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message });
}

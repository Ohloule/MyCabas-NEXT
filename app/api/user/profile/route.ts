import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        address: {
          select: {
            street: true,
            zip: true,
            town: true,
            country: true,
          },
        },
        favoriteMarkets: {
          select: {
            id: true,
            day: true,
            market: {
              select: {
                id: true,
                name: true,
                address: true,
                town: true,
                openings: {
                  select: {
                    day: true,
                    start: true,
                    end: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { firstName, lastName, phone, street, zip, town, country } = body;

  // Update user info
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName,
      lastName,
      phone: phone || null,
    },
  });

  // Upsert address
  if (street || zip || town) {
    await prisma.address.upsert({
      where: { userId: session.user.id },
      update: {
        street: street || "",
        zip: zip || "",
        town: town || "",
        country: country || "France",
      },
      create: {
        userId: session.user.id,
        street: street || "",
        zip: zip || "",
        town: town || "",
        country: country || "France",
      },
    });
  }

  return NextResponse.json({
    success: true,
    user: updatedUser,
  });
}

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Day } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ marketId: string }>;
}

// GET - Vérifier si un marché + jour est en favori
// Query param: ?day=LUNDI
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { marketId } = await params;
  const day = request.nextUrl.searchParams.get("day") as Day | null;

  if (!day) {
    return NextResponse.json({ error: "Paramètre day requis" }, { status: 400 });
  }

  try {
    const favorite = await prisma.favoriteMarket.findUnique({
      where: {
        userId_marketId_day: {
          userId: session.user.id,
          marketId,
          day,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Erreur vérification favori:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}

// POST - Toggle favori pour un marché + jour
// Query param: ?day=LUNDI
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { marketId } = await params;
  const day = request.nextUrl.searchParams.get("day") as Day | null;

  if (!day) {
    return NextResponse.json({ error: "Paramètre day requis" }, { status: 400 });
  }

  try {
    // Vérifier que le marché existe et est ouvert ce jour
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: { openings: true },
    });

    if (!market) {
      return NextResponse.json(
        { error: "Marché non trouvé" },
        { status: 404 }
      );
    }

    const isOpenThisDay = market.openings.some((o) => o.day === day);
    if (!isOpenThisDay) {
      return NextResponse.json(
        { error: "Le marché n'est pas ouvert ce jour" },
        { status: 400 }
      );
    }

    // Vérifier si déjà en favori
    const existingFavorite = await prisma.favoriteMarket.findUnique({
      where: {
        userId_marketId_day: {
          userId: session.user.id,
          marketId,
          day,
        },
      },
    });

    if (existingFavorite) {
      // Supprimer des favoris
      await prisma.favoriteMarket.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ isFavorite: false });
    } else {
      // Ajouter aux favoris
      await prisma.favoriteMarket.create({
        data: {
          userId: session.user.id,
          marketId,
          day,
        },
      });
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error) {
    console.error("Erreur toggle favori:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

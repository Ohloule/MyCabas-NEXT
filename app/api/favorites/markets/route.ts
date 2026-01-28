import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Liste des marchés favoris de l'utilisateur (avec leur jour)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const favorites = await prisma.favoriteMarket.findMany({
      where: { userId: session.user.id },
      include: {
        market: {
          include: {
            openings: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      favorites: favorites.map((f) => ({
        id: f.id,
        day: f.day,
        market: f.market,
      })),
      count: favorites.length,
    });
  } catch (error) {
    console.error("Erreur récupération favoris:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des favoris" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un marché + jour aux favoris
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { marketId, day } = await request.json();

    if (!marketId || !day) {
      return NextResponse.json(
        { error: "marketId et day requis" },
        { status: 400 }
      );
    }

    // Vérifier que le marché existe
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

    // Vérifier que le marché est ouvert ce jour-là
    const isOpenThisDay = market.openings.some((o) => o.day === day);
    if (!isOpenThisDay) {
      return NextResponse.json(
        { error: "Le marché n'est pas ouvert ce jour" },
        { status: 400 }
      );
    }

    // Créer le favori (ou ignorer si existe déjà)
    const favorite = await prisma.favoriteMarket.upsert({
      where: {
        userId_marketId_day: {
          userId: session.user.id,
          marketId,
          day,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        marketId,
        day,
      },
      include: {
        market: true,
      },
    });

    return NextResponse.json({
      success: true,
      favorite: {
        id: favorite.id,
        day: favorite.day,
        market: favorite.market,
      },
    });
  } catch (error) {
    console.error("Erreur ajout favori:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout aux favoris" },
      { status: 500 }
    );
  }
}

// DELETE - Retirer un marché + jour des favoris
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { marketId, day } = await request.json();

    if (!marketId || !day) {
      return NextResponse.json(
        { error: "marketId et day requis" },
        { status: 400 }
      );
    }

    await prisma.favoriteMarket.deleteMany({
      where: {
        userId: session.user.id,
        marketId,
        day,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression favori:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du favori" },
      { status: 500 }
    );
  }
}

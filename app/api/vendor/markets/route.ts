import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Day } from "@prisma/client";

// GET - Liste des marchés du vendeur avec les jours sélectionnés
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les marchés où le vendeur est inscrit
    const marketVendors = await prisma.marketVendor.findMany({
      where: { vendorId: session.user.vendorId },
      include: {
        market: {
          include: {
            openings: true
          }
        }
      }
    });

    // Retourner les marchés avec les jours sélectionnés
    const markets = marketVendors.map(mv => ({
      ...mv.market,
      selectedDays: mv.days
    }));

    return NextResponse.json(markets);
  } catch (error) {
    console.error("Error fetching vendor markets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des marchés" },
      { status: 500 }
    );
  }
}

// POST - S'inscrire à un marché avec les jours sélectionnés
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    console.log("Session user:", JSON.stringify(session?.user, null, 2));

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { marketId, days } = body;

    if (!marketId) {
      return NextResponse.json(
        { error: "L'identifiant du marché est requis" },
        { status: 400 }
      );
    }

    if (!days || !Array.isArray(days) || days.length === 0) {
      return NextResponse.json(
        { error: "Veuillez sélectionner au moins un jour" },
        { status: 400 }
      );
    }

    // Valider les jours
    const validDays = Object.values(Day);
    const invalidDays = days.filter((d: string) => !validDays.includes(d as Day));
    if (invalidDays.length > 0) {
      return NextResponse.json(
        { error: `Jours invalides: ${invalidDays.join(", ")}` },
        { status: 400 }
      );
    }

    // Vérifier que le marché existe et récupérer ses jours d'ouverture
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: { openings: true }
    });

    if (!market) {
      return NextResponse.json(
        { error: "Marché non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que les jours sélectionnés correspondent aux jours d'ouverture du marché
    const marketDays = market.openings.map(o => o.day);
    const invalidSelections = days.filter((d: string) => !marketDays.includes(d as Day));
    if (invalidSelections.length > 0) {
      return NextResponse.json(
        { error: `Le marché n'est pas ouvert ces jours: ${invalidSelections.join(", ")}` },
        { status: 400 }
      );
    }

    // Vérifier si déjà inscrit
    const existing = await prisma.marketVendor.findUnique({
      where: {
        vendorId_marketId: {
          vendorId: session.user.vendorId,
          marketId: marketId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit à ce marché" },
        { status: 409 }
      );
    }

    // Créer l'inscription avec les jours
    const marketVendor = await prisma.marketVendor.create({
      data: {
        vendorId: session.user.vendorId,
        marketId: marketId,
        days: days as Day[]
      },
      include: {
        market: {
          include: {
            openings: true
          }
        }
      }
    });

    return NextResponse.json({
      ...marketVendor.market,
      selectedDays: marketVendor.days
    }, { status: 201 });
  } catch (error) {
    console.error("Error registering to market:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Erreur lors de l'inscription au marché", details: String(error) },
      { status: 500 }
    );
  }
}

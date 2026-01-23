import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Liste des marchés du vendeur
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

    // Extraire les marchés
    const markets = marketVendors.map(mv => mv.market);

    return NextResponse.json(markets);
  } catch (error) {
    console.error("Error fetching vendor markets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des marchés" },
      { status: 500 }
    );
  }
}

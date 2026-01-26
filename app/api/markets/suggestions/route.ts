import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // Rechercher les marchés correspondants
    const markets = await prisma.market.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { town: { contains: query, mode: "insensitive" } },
          { zip: { startsWith: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        town: true,
        zip: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    // Créer des suggestions uniques
    const suggestions = markets.map((market) => ({
      id: market.id,
      label: `${market.name} - ${market.town} (${market.zip})`,
      name: market.name,
      town: market.town,
      zip: market.zip,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des suggestions" },
      { status: 500 }
    );
  }
}

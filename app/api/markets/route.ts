import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Calcul de la distance entre deux points GPS (formule de Haversine)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "20"; // Rayon par défaut: 20km
    const town = searchParams.get("town");
    const zip = searchParams.get("zip");
    const search = searchParams.get("search"); // Recherche générale (ville ou code postal)
    const day = searchParams.get("day");

    // Construire les conditions de recherche
    const whereConditions: Record<string, unknown>[] = [];

    if (search) {
      // Recherche par ville OU code postal
      whereConditions.push(
        { town: { contains: search, mode: "insensitive" } },
        { zip: { startsWith: search } }
      );
    } else {
      if (town) {
        whereConditions.push({ town: { contains: town, mode: "insensitive" } });
      }
      if (zip) {
        whereConditions.push({ zip: { startsWith: zip } });
      }
    }

    // Récupérer tous les marchés avec leurs horaires
    const markets = await prisma.market.findMany({
      include: {
        openings: true,
      },
      ...(whereConditions.length > 0
        ? {
            where: {
              OR: whereConditions,
            },
          }
        : {}),
    });

    let filteredMarkets = markets;

    // Filtrer par proximité si coordonnées fournies
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      filteredMarkets = markets
        .map((market) => ({
          ...market,
          distance: calculateDistance(userLat, userLng, market.lat, market.lng),
        }))
        .filter((market) => market.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
    }

    // Filtrer par jour si spécifié
    if (day) {
      filteredMarkets = filteredMarkets.filter((market) =>
        market.openings.some(
          (opening) => opening.day.toLowerCase() === day.toLowerCase()
        )
      );
    }

    return NextResponse.json({
      markets: filteredMarkets,
      total: filteredMarkets.length,
    });
  } catch (error) {
    console.error("Markets fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des marchés" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MAX_RESULTS = 200;

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

// Calcul du bounding box pour pré-filtrer en SQL
function getBoundingBox(lat: number, lng: number, radiusKm: number) {
  // 1 degré de latitude ≈ 111 km
  const latDelta = radiusKm / 111;
  // 1 degré de longitude varie selon la latitude
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
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

    // Recherche par coordonnées GPS avec bounding box
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);

      // Calculer le bounding box pour pré-filtrer en SQL
      const bbox = getBoundingBox(userLat, userLng, radiusKm);

      // Requête avec pré-filtrage géographique
      const markets = await prisma.market.findMany({
        where: {
          lat: { gte: bbox.minLat, lte: bbox.maxLat },
          lng: { gte: bbox.minLng, lte: bbox.maxLng },
        },
        include: {
          openings: true,
        },
      });

      // Calcul de la distance exacte et filtrage final
      let filteredMarkets = markets
        .map((market) => ({
          ...market,
          distance: calculateDistance(userLat, userLng, market.lat, market.lng),
        }))
        .filter((market) => market.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      // Filtrer par jour si spécifié
      if (day) {
        filteredMarkets = filteredMarkets.filter((market) =>
          market.openings.some(
            (opening) => opening.day.toLowerCase() === day.toLowerCase()
          )
        );
      }

      // Limiter les résultats
      const limitedMarkets = filteredMarkets.slice(0, MAX_RESULTS);

      return NextResponse.json({
        markets: limitedMarkets,
        total: filteredMarkets.length,
        limited: filteredMarkets.length > MAX_RESULTS,
      });
    }

    // Recherche par ville/code postal
    const whereConditions: Record<string, unknown>[] = [];

    if (search) {
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

    // Récupérer les marchés avec limite
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
      take: MAX_RESULTS,
      orderBy: { name: "asc" },
    });

    let filteredMarkets = markets;

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

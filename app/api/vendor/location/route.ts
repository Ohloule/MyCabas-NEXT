import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface GeoApiFeature {
  properties: {
    label: string;
    score: number;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface GeoApiResponse {
  features: GeoApiFeature[];
}

interface SireneEtablissement {
  siege: {
    latitude: string | null;
    longitude: string | null;
    adresse: string;
    code_postal: string;
    commune: string;
  };
}

interface SireneApiResponse {
  results: SireneEtablissement[];
}

// Géocoder une adresse via api-adresse.data.gouv.fr
async function geocodeAddress(street: string, zip: string, town: string) {
  const searchQuery = `${street} ${zip} ${town}`;
  const apiUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(searchQuery)}&limit=1`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Erreur API adresse.data.gouv.fr: ${response.status}`);
  }

  const data: GeoApiResponse = await response.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Adresse non trouvée");
  }

  const feature = data.features[0];
  const [lng, lat] = feature.geometry.coordinates;

  return {
    lat,
    lng,
    geocodedLabel: feature.properties.label,
    score: feature.properties.score,
  };
}

// Récupérer l'adresse de l'entreprise via son SIRET
async function getAddressFromSiret(siret: string) {
  const apiUrl = `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=1`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(`Erreur API entreprises: ${response.status}`);
  }

  const data: SireneApiResponse = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Entreprise non trouvée");
  }

  const siege = data.results[0].siege;

  // Si l'API retourne déjà les coordonnées GPS
  if (siege.latitude && siege.longitude) {
    return {
      lat: parseFloat(siege.latitude),
      lng: parseFloat(siege.longitude),
      address: {
        street: siege.adresse,
        zip: siege.code_postal,
        town: siege.commune,
      },
      source: "siret" as const,
    };
  }

  // Sinon, géocoder l'adresse
  const geocoded = await geocodeAddress(
    siege.adresse,
    siege.code_postal,
    siege.commune
  );

  return {
    lat: geocoded.lat,
    lng: geocoded.lng,
    address: {
      street: siege.adresse,
      zip: siege.code_postal,
      town: siege.commune,
    },
    geocodedLabel: geocoded.geocodedLabel,
    score: geocoded.score,
    source: "siret" as const,
  };
}

// GET - Récupérer les coordonnées GPS du vendeur à partir de son adresse ou SIRET
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'adresse de l'utilisateur
    const address = await prisma.address.findUnique({
      where: { userId: session.user.id },
    });

    // Si l'utilisateur a une adresse, l'utiliser
    if (address) {
      try {
        const geocoded = await geocodeAddress(
          address.street,
          address.zip,
          address.town
        );

        return NextResponse.json({
          lat: geocoded.lat,
          lng: geocoded.lng,
          address: {
            street: address.street,
            zip: address.zip,
            town: address.town,
          },
          geocodedLabel: geocoded.geocodedLabel,
          score: geocoded.score,
          source: "address",
        });
      } catch (err) {
        console.error("Erreur géocodage adresse utilisateur:", err);
        // Continuer avec le SIRET en fallback
      }
    }

    // Fallback: utiliser le SIRET du vendeur
    const vendor = await prisma.vendor.findFirst({
      where: { userId: session.user.id },
      select: { siret: true },
    });

    if (!vendor?.siret) {
      return NextResponse.json(
        { error: "Aucune adresse et aucun SIRET trouvé" },
        { status: 404 }
      );
    }

    try {
      const location = await getAddressFromSiret(vendor.siret);
      return NextResponse.json(location);
    } catch (err) {
      console.error("Erreur récupération adresse via SIRET:", err);
      return NextResponse.json(
        { error: "Impossible de déterminer votre localisation" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching vendor location:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la localisation" },
      { status: 500 }
    );
  }
}

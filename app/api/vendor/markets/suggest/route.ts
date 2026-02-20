import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Day, MarketStatus } from "@prisma/client";

// POST - Soumettre un nouveau marché (statut PENDING, en attente de validation admin)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, address, zip, town, lat, lng, openings } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "Le nom du marché est requis" }, { status: 400 });
    }
    if (!address?.trim() || !zip?.trim() || !town?.trim()) {
      return NextResponse.json({ error: "L'adresse complète est requise" }, { status: 400 });
    }
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Les coordonnées GPS sont requises" }, { status: 400 });
    }
    if (!Array.isArray(openings) || openings.length === 0) {
      return NextResponse.json({ error: "Au moins un jour d'ouverture est requis" }, { status: 400 });
    }

    // Valider les jours et normaliser les horaires (HH:MM, sans secondes)
    const validDays = Object.values(Day);
    const normalizedOpenings: { day: Day; start: string; end: string }[] = [];
    for (const opening of openings) {
      if (!validDays.includes(opening.day as Day)) {
        return NextResponse.json({ error: `Jour invalide: ${opening.day}` }, { status: 400 });
      }
      // Normaliser HH:MM (certains navigateurs retournent HH:MM:SS)
      const start = String(opening.start || "").slice(0, 5);
      const end = String(opening.end || "").slice(0, 5);
      if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
        return NextResponse.json({ error: "Format d'heure invalide (attendu HH:MM)" }, { status: 400 });
      }
      normalizedOpenings.push({ day: opening.day as Day, start, end });
    }

    // Créer le marché avec statut PENDING
    const market = await prisma.market.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        zip: zip.trim(),
        town: town.trim(),
        lat,
        lng,
        status: MarketStatus.PENDING,
        submittedByVendorId: session.user.vendorId,
        openings: {
          create: normalizedOpenings,
        },
      },
      include: { openings: true },
    });

    return NextResponse.json(market, { status: 201 });
  } catch (error) {
    console.error("Error submitting market:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la soumission du marché",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

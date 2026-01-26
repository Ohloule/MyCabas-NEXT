import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Day } from "@prisma/client";

// PUT - Modifier les jours de présence sur un marché
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { marketId } = await params;
    const body = await request.json();
    const { days } = body;

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

    // Vérifier si l'inscription existe
    const existing = await prisma.marketVendor.findUnique({
      where: {
        vendorId_marketId: {
          vendorId: session.user.vendorId,
          marketId: marketId
        }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Vous n'êtes pas inscrit à ce marché" },
        { status: 404 }
      );
    }

    // Mettre à jour les jours
    const marketVendor = await prisma.marketVendor.update({
      where: {
        vendorId_marketId: {
          vendorId: session.user.vendorId,
          marketId: marketId
        }
      },
      data: {
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
    });
  } catch (error) {
    console.error("Error updating market days:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des jours" },
      { status: 500 }
    );
  }
}

// DELETE - Se désinscrire d'un marché
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { marketId } = await params;

    if (!marketId) {
      return NextResponse.json(
        { error: "L'identifiant du marché est requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'inscription existe
    const marketVendor = await prisma.marketVendor.findUnique({
      where: {
        vendorId_marketId: {
          vendorId: session.user.vendorId,
          marketId: marketId
        }
      }
    });

    if (!marketVendor) {
      return NextResponse.json(
        { error: "Vous n'êtes pas inscrit à ce marché" },
        { status: 404 }
      );
    }

    // Supprimer l'inscription
    await prisma.marketVendor.delete({
      where: {
        vendorId_marketId: {
          vendorId: session.user.vendorId,
          marketId: marketId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unregistering from market:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désinscription du marché" },
      { status: 500 }
    );
  }
}

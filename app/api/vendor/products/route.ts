import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Liste des produits du vendeur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      where: { vendorId: session.user.vendorId },
      include: {
        category: true,
        pricesByMarket: {
          include: { market: true }
        },
        stocksByMarket: {
          include: { market: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      imageUrl,
      unit,
      basePrice,
      categoryId,
      isOrganic,
      isLocal,
      marketPrices // Array of { marketId, price, isAvailable, quantity, isUnlimited }
    } = body;

    // Validation
    if (!name || !basePrice || !categoryId || !unit) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (nom, prix, catégorie, unité)" },
        { status: 400 }
      );
    }

    // Créer le produit avec ses prix et stocks par marché
    const product = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        unit,
        basePrice: parseFloat(basePrice),
        categoryId,
        vendorId: session.user.vendorId,
        isOrganic: isOrganic || false,
        isLocal: isLocal || false,
        // Créer les prix par marché si fournis
        ...(marketPrices && marketPrices.length > 0 ? {
          pricesByMarket: {
            create: marketPrices.map((mp: { marketId: string; price?: number; isAvailable?: boolean }) => ({
              marketId: mp.marketId,
              price: mp.price || null,
              isAvailable: mp.isAvailable !== false
            }))
          },
          stocksByMarket: {
            create: marketPrices.map((mp: { marketId: string; quantity?: number; isUnlimited?: boolean }) => ({
              marketId: mp.marketId,
              quantity: mp.isUnlimited ? null : (mp.quantity || null),
              isUnlimited: mp.isUnlimited !== false
            }))
          }
        } : {})
      },
      include: {
        category: true,
        pricesByMarket: { include: { market: true } },
        stocksByMarket: { include: { market: true } }
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface ProductUpdate {
  productId: string;
  marketId: string;
  price: number | null;
  quantity: number | null;
  isAvailable: boolean;
  isUnlimited: boolean;
}

// PATCH - Mise à jour en batch des prix/stocks pour un marché
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { updates } = body as { updates: ProductUpdate[] };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Aucune mise à jour fournie" },
        { status: 400 }
      );
    }

    // Vérifier que tous les produits appartiennent au vendeur
    const productIds = [...new Set(updates.map(u => u.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        vendorId: session.user.vendorId
      },
      select: { id: true }
    });

    const validProductIds = new Set(products.map(p => p.id));
    const invalidProducts = productIds.filter(id => !validProductIds.has(id));

    if (invalidProducts.length > 0) {
      return NextResponse.json(
        { error: "Certains produits n'existent pas ou ne vous appartiennent pas" },
        { status: 403 }
      );
    }

    // Exécuter les mises à jour dans une transaction
    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        // Upsert ProductPrice
        await tx.productPrice.upsert({
          where: {
            productId_marketId: {
              productId: update.productId,
              marketId: update.marketId
            }
          },
          create: {
            productId: update.productId,
            marketId: update.marketId,
            price: update.price,
            isAvailable: update.isAvailable
          },
          update: {
            price: update.price,
            isAvailable: update.isAvailable
          }
        });

        // Upsert ProductStock
        await tx.productStock.upsert({
          where: {
            productId_marketId: {
              productId: update.productId,
              marketId: update.marketId
            }
          },
          create: {
            productId: update.productId,
            marketId: update.marketId,
            quantity: update.isUnlimited ? null : update.quantity,
            isUnlimited: update.isUnlimited
          },
          update: {
            quantity: update.isUnlimited ? null : update.quantity,
            isUnlimited: update.isUnlimited
          }
        });
      }
    });

    return NextResponse.json({
      message: "Mise à jour réussie",
      updatedCount: updates.length
    });
  } catch (error) {
    console.error("Error batch updating products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des produits" },
      { status: 500 }
    );
  }
}

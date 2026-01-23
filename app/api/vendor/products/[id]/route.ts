import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        vendorId: session.user.vendorId
      },
      include: {
        category: true,
        pricesByMarket: { include: { market: true } },
        stocksByMarket: { include: { market: true } }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier que le produit appartient au vendeur
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorId: session.user.vendorId
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
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
      isActive,
      marketPrices
    } = body;

    // Mettre à jour le produit dans une transaction
    const product = await prisma.$transaction(async (tx) => {
      // Mettre à jour le produit
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          imageUrl,
          unit,
          basePrice: basePrice ? parseFloat(basePrice) : undefined,
          categoryId,
          isOrganic,
          isLocal,
          isActive
        }
      });

      // Mettre à jour les prix et stocks par marché si fournis
      if (marketPrices && marketPrices.length > 0) {
        for (const mp of marketPrices) {
          // Upsert ProductPrice
          await tx.productPrice.upsert({
            where: {
              productId_marketId: {
                productId: id,
                marketId: mp.marketId
              }
            },
            create: {
              productId: id,
              marketId: mp.marketId,
              price: mp.price || null,
              isAvailable: mp.isAvailable !== false
            },
            update: {
              price: mp.price || null,
              isAvailable: mp.isAvailable !== false
            }
          });

          // Upsert ProductStock
          await tx.productStock.upsert({
            where: {
              productId_marketId: {
                productId: id,
                marketId: mp.marketId
              }
            },
            create: {
              productId: id,
              marketId: mp.marketId,
              quantity: mp.isUnlimited ? null : (mp.quantity || null),
              isUnlimited: mp.isUnlimited !== false
            },
            update: {
              quantity: mp.isUnlimited ? null : (mp.quantity || null),
              isUnlimited: mp.isUnlimited !== false
            }
          });
        }
      }

      return updatedProduct;
    });

    // Récupérer le produit complet avec ses relations
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        pricesByMarket: { include: { market: true } },
        stocksByMarket: { include: { market: true } }
      }
    });

    return NextResponse.json(fullProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Vérifier que le produit appartient au vendeur
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        vendorId: session.user.vendorId
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le produit (les relations seront supprimées en cascade)
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}

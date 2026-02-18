import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer le panier de l'utilisateur
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        market: {
          select: { id: true, name: true, address: true, town: true },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                unit: true,
                minOrderQty: true,
                basePrice: true,
                vendor: {
                  select: { id: true, stallName: true },
                },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(cart);
  } catch (err) {
    console.error("GET /api/cart error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter un produit au panier (ou mettre à jour la quantité)
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { productId, quantity = 1, marketId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId requis" },
        { status: 400 }
      );
    }

    // Valider la quantité par rapport au MOQ du produit
    if (quantity > 0) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { minOrderQty: true },
      });

      if (product && product.minOrderQty > 0) {
        const moq = product.minOrderQty;
        const rounded = Math.round(quantity / moq) * moq;
        const decimals = (moq.toString().split(".")[1] || "").length;
        const validQty = Math.max(moq, parseFloat(rounded.toFixed(decimals)));
        if (Math.abs(quantity - validQty) > 0.001) {
          return NextResponse.json(
            { error: `La quantité doit être un multiple de ${moq}`, validQuantity: validQty },
            { status: 400 }
          );
        }
      }
    }

    // Upsert du panier
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
          marketId: marketId || null,
        },
      });
    } else if (marketId && cart.marketId !== marketId) {
      // Si le marché change, on met à jour
      cart = await prisma.cart.update({
        where: { id: cart.id },
        data: { marketId },
      });
    }

    // Upsert de l'item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity,
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (err) {
    console.error("POST /api/cart error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Mettre à jour la quantité d'un item
export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: "itemId et quantity requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'item appartient bien au panier de l'utilisateur
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ deleted: true });
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/cart error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un item ou vider le panier
export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });
    }

    if (itemId) {
      // Supprimer un item spécifique
      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
      });

      if (!item || item.cartId !== cart.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      }

      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      // Vider tout le panier
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

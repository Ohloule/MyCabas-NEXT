import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Day } from "@prisma/client";
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
                stepIncrement: true,
                basePrice: true,
                vendor: {
                  select: { id: true, stallName: true },
                },
                category: {
                  select: { id: true, name: true },
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
    const { productId, quantity = 1, marketId, day } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "productId requis" },
        { status: 400 }
      );
    }

    // Valider la quantité par rapport au seuil minimum et à la tranche du produit
    if (quantity > 0) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { minOrderQty: true, stepIncrement: true },
      });

      if (product && product.minOrderQty > 0) {
        const min = product.minOrderQty;
        const step = product.stepIncrement || min;

        if (quantity < min - 0.001) {
          return NextResponse.json(
            { error: `La quantité minimale est de ${min}`, validQuantity: min },
            { status: 400 }
          );
        }

        const decimals = Math.max(
          (min.toString().split(".")[1] || "").length,
          (step.toString().split(".")[1] || "").length,
        );
        const stepsAboveMin = Math.round((quantity - min) / step);
        const validQty = parseFloat((min + stepsAboveMin * step).toFixed(decimals));
        if (Math.abs(quantity - validQty) > 0.001) {
          return NextResponse.json(
            { error: `La quantité doit être un multiple de ${step} à partir de ${min}`, validQuantity: validQty },
            { status: 400 }
          );
        }
      }
    }

    // Valider que le marketId existe en base (évite la violation FK)
    let validatedMarketId: string | null = null;
    if (marketId) {
      const marketExists = await prisma.market.findUnique({
        where: { id: marketId },
        select: { id: true },
      });
      if (marketExists) {
        validatedMarketId = marketId;
      } else {
        console.warn(`POST /api/cart: marketId "${marketId}" introuvable en base, ignoré`);
      }
    }

    // Upsert du panier
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    // Valider le jour (doit être un enum Day valide)
    const VALID_DAYS = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI","DIMANCHE"];
    const validatedDay: string | null = day && VALID_DAYS.includes(String(day).toUpperCase())
      ? String(day).toUpperCase()
      : null;

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
          marketId: validatedMarketId,
          ...(validatedMarketId && validatedDay ? { marketDay: validatedDay as Day } : {}),
        },
      });
    } else if (validatedMarketId && (cart.marketId !== validatedMarketId || validatedDay !== cart.marketDay)) {
      // Si le marché ou le jour change, on met à jour
      try {
        cart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            marketId: validatedMarketId,
            ...(validatedDay ? { marketDay: validatedDay as Day } : {}),
          },
        });
      } catch (updateErr) {
        console.error("POST /api/cart: impossible de mettre à jour marketId/marketDay:", updateErr);
      }
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

// PATCH - Mettre à jour uniquement le marché associé au panier
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { marketId, day } = await request.json();

    if (!marketId) {
      return NextResponse.json({ error: "marketId requis" }, { status: 400 });
    }

    // Valider que le marché existe en base
    const marketExists = await prisma.market.findUnique({
      where: { id: marketId },
      select: { id: true },
    });

    if (!marketExists) {
      console.warn(`PATCH /api/cart: marketId "${marketId}" introuvable en base`);
      return NextResponse.json({ error: "Marché introuvable" }, { status: 404 });
    }

    const VALID_DAYS = ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI","SAMEDI","DIMANCHE"];
    const validatedDay: string | null = day && VALID_DAYS.includes(String(day).toUpperCase())
      ? String(day).toUpperCase()
      : null;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      const newCart = await prisma.cart.create({
        data: {
          userId: session.user.id,
          marketId,
          ...(validatedDay ? { marketDay: validatedDay as Day } : {}),
        },
      });
      return NextResponse.json(newCart);
    }

    if (cart.marketId === marketId && (!validatedDay || cart.marketDay === validatedDay)) {
      return NextResponse.json(cart);
    }

    const updated = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        marketId,
        ...(validatedDay ? { marketDay: validatedDay as Day } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/cart error:", err);
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
      // Supprimer le panier entier (les CartItem sont supprimés en cascade)
      await prisma.cart.delete({ where: { id: cart.id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/cart error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

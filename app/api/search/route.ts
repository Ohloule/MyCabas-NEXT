import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Vérifier l'authentification
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const categorySlug = searchParams.get("category");

  // Au moins un filtre requis
  if (!query && !categorySlug) {
    return NextResponse.json(
      { error: "Paramètre q ou category requis" },
      { status: 400 }
    );
  }

  try {
    // Récupérer les marchés favoris de l'utilisateur
    const favoriteMarkets = await prisma.favoriteMarket.findMany({
      where: { userId: session.user.id },
      select: { marketId: true },
    });

    const favoriteMarketIds = favoriteMarkets.map((f) => f.marketId);

    // Si pas de marchés favoris, retourner vide
    if (favoriteMarketIds.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        vendorCount: 0,
      });
    }

    // Récupérer les vendors inscrits aux marchés favoris
    const marketVendors = await prisma.marketVendor.findMany({
      where: { marketId: { in: favoriteMarketIds } },
      select: { vendorId: true },
    });

    const vendorIds = [...new Set(marketVendors.map((mv) => mv.vendorId))];

    // Construire les conditions de recherche
    const whereConditions: Record<string, unknown> = {
      isActive: true,
      vendorId: { in: vendorIds },
    };

    // Filtre par catégorie
    if (categorySlug) {
      whereConditions.category = {
        slug: categorySlug,
      };
    }

    // Filtre par recherche textuelle
    if (query) {
      whereConditions.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { vendor: { stallName: { contains: query, mode: "insensitive" } } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereConditions,
      include: {
        category: true,
        vendor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: [
        { vendor: { stallName: "asc" } },
        { name: "asc" },
      ],
    });

    // Grouper les produits par vendor
    const vendorsMap = new Map<
      string,
      {
        vendor: typeof products[0]["vendor"];
        products: typeof products;
      }
    >();

    for (const product of products) {
      const vendorId = product.vendorId;
      if (!vendorsMap.has(vendorId)) {
        vendorsMap.set(vendorId, {
          vendor: product.vendor,
          products: [],
        });
      }
      vendorsMap.get(vendorId)!.products.push(product);
    }

    const results = Array.from(vendorsMap.values());

    return NextResponse.json({
      results,
      total: products.length,
      vendorCount: results.length,
    });
  } catch (error) {
    console.error("Erreur recherche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}

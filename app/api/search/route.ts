import { auth } from "@/lib/auth";
import { resolveSearchQuery } from "@/lib/ai/resolve-search-query";
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
    // Récupérer les marchés favoris de l'utilisateur (avec le jour)
    const favoriteMarkets = await prisma.favoriteMarket.findMany({
      where: { userId: session.user.id },
      select: { marketId: true, day: true },
    });

    const favoriteMarketIds = [...new Set(favoriteMarkets.map((f) => f.marketId))];

    // Map marketId -> Set<day> pour les favoris
    const favDaysByMarket = new Map<string, Set<string>>();
    for (const fav of favoriteMarkets) {
      if (!favDaysByMarket.has(fav.marketId)) {
        favDaysByMarket.set(fav.marketId, new Set());
      }
      favDaysByMarket.get(fav.marketId)!.add(fav.day);
    }

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

    // Résoudre la requête via Haiku (ex: "pink lady" → "POMME")
    let resolvedQuery: string | null = null;
    if (query) {
      resolvedQuery = await resolveSearchQuery(query);
    }

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
      const genericSearchTerm = resolvedQuery ?? query;
      whereConditions.OR = [
        // Priorité : recherche par nom générique (terme résolu par l'IA)
        { genericName: { contains: genericSearchTerm, mode: "insensitive" } },
        // Fallback : recherche textuelle classique sur le nom, description, commerçant
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

    // Récupérer les marchés favoris de chaque vendor (avec les jours de présence)
    const vendorMarketsList = await prisma.marketVendor.findMany({
      where: {
        vendorId: { in: Array.from(vendorsMap.keys()) },
        marketId: { in: favoriteMarketIds },
      },
      select: {
        vendorId: true,
        days: true,
        market: {
          select: { id: true, name: true, town: true },
        },
      },
    });

    // Construire les paires (marché, jour) : intersection entre les jours du vendor
    // et les jours que l'utilisateur a mis en favori pour ce marché
    const vendorMarketsMap = new Map<
      string,
      Array<{ id: string; name: string; town: string; day: string }>
    >();
    for (const vm of vendorMarketsList) {
      if (!vendorMarketsMap.has(vm.vendorId)) {
        vendorMarketsMap.set(vm.vendorId, []);
      }
      const favDays = favDaysByMarket.get(vm.market.id) ?? new Set();
      for (const day of vm.days) {
        if (favDays.has(day)) {
          vendorMarketsMap.get(vm.vendorId)!.push({ ...vm.market, day });
        }
      }
    }

    const results = Array.from(vendorsMap.values()).map(
      ({ vendor, products: vendorProducts }) => ({
        vendor,
        products: vendorProducts,
        vendorMarkets: vendorMarketsMap.get(vendor.id) ?? [],
      })
    );

    return NextResponse.json({
      results,
      total: products.length,
      vendorCount: results.length,
      resolvedQuery,
    });
  } catch (error) {
    console.error("Erreur recherche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}

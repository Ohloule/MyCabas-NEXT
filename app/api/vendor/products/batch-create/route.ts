import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { suggestGenericName } from "@/lib/ai/suggest-generic-name";
import {
  translateToEnglish,
  fetchUnsplashImage,
  VALID_UNITS,
} from "@/lib/product-utils";

interface BatchCreateRow {
  name: string;
  description?: string | null;
  categoryId: string;
  unit: string;
  basePrice: number;
  canSellByPiece?: boolean;
  pricePerPiece?: number | null;
  imageData?: string | null;
  isOrganic: boolean;
  isLocal: boolean;
}

interface RowError {
  index: number;
  messages: string[];
}

const MAX_BATCH_SIZE = 50;

// POST - Création en lot de produits
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { products } = body as { products: BatchCreateRow[] };

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Aucun produit fourni" },
        { status: 400 },
      );
    }

    if (products.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_BATCH_SIZE} produits par lot` },
        { status: 400 },
      );
    }

    // Récupérer les catégories pour validation
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    const categoryIds = new Set(categories.map((c) => c.id));
    const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

    // Récupérer les noms existants pour détection de doublons
    const existingProducts = await prisma.product.findMany({
      where: { vendorId: session.user.vendorId },
      select: { name: true },
    });
    const existingNames = new Set(
      existingProducts.map((p) => p.name.toLowerCase()),
    );

    // Validation de chaque ligne
    const errors: RowError[] = [];
    const validRows: (BatchCreateRow & { index: number })[] = [];
    const namesInBatch = new Map<string, number>();

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const rowErrors: string[] = [];

      // Nom : normaliser majuscule au début, reste en minuscule
      const rawName = (row.name ?? "").trim();
      const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase() : "";
      if (!name) {
        rowErrors.push("Le nom est obligatoire");
      } else if (name.length > 100) {
        rowErrors.push("Le nom ne doit pas dépasser 100 caractères");
      } else {
        const lowerName = name.toLowerCase();
        if (existingNames.has(lowerName)) {
          rowErrors.push(`Un produit "${name}" existe déjà`);
        }
        if (namesInBatch.has(lowerName)) {
          rowErrors.push(
            `Doublon avec la ligne ${(namesInBatch.get(lowerName) ?? 0) + 1}`,
          );
        }
        namesInBatch.set(lowerName, i);
      }

      // Catégorie
      if (!row.categoryId) {
        rowErrors.push("La catégorie est obligatoire");
      } else if (!categoryIds.has(row.categoryId)) {
        rowErrors.push("Catégorie invalide");
      }

      // Unité
      if (!row.unit) {
        rowErrors.push("L'unité est obligatoire");
      } else if (!VALID_UNITS.includes(row.unit)) {
        rowErrors.push(`Unité invalide "${row.unit}"`);
      }

      // Prix
      const price =
        typeof row.basePrice === "number" ? row.basePrice : parseFloat(String(row.basePrice));
      if (isNaN(price) || price <= 0) {
        rowErrors.push("Le prix doit être supérieur à 0");
      } else if (price > 10000) {
        rowErrors.push("Le prix semble trop élevé (max 10 000 €)");
      }

      if (rowErrors.length > 0) {
        errors.push({ index: i, messages: rowErrors });
      } else {
        validRows.push({ ...row, name, basePrice: price, index: i });
      }
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        { created: 0, errors },
        { status: 400 },
      );
    }

    // Récupérer les images Unsplash en parallèle (sauf si image fournie)
    const imageResults = await Promise.allSettled(
      validRows.map(async (row) => {
        if (row.imageData) return row.imageData;
        const englishName = await translateToEnglish(row.name);
        return fetchUnsplashImage(englishName);
      }),
    );
    const imageUrls = imageResults.map((r) =>
      r.status === "fulfilled" ? r.value : null,
    );

    // Générer les noms génériques en parallèle (non bloquant)
    const genericNameResults = await Promise.allSettled(
      validRows.map((row) =>
        suggestGenericName(row.name, categoryNameById.get(row.categoryId) ?? ""),
      ),
    );
    const genericNames = genericNameResults.map((r) =>
      r.status === "fulfilled" ? r.value : null,
    );

    // Récupérer les marchés du vendeur pour y associer les produits
    const vendorMarkets = await prisma.marketVendor.findMany({
      where: { vendorId: session.user.vendorId },
      select: { marketId: true },
    });

    // Créer tous les produits dans une transaction
    const createdProducts = await prisma.$transaction(async (tx) => {
      const created = [];

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];

        // Calcul de approxWeightPerPiece = pricePerPiece / basePrice
        const parsedPricePerPiece = row.pricePerPiece ?? null;
        const computedApproxWeight =
          row.canSellByPiece && parsedPricePerPiece && row.basePrice > 0
            ? parseFloat((parsedPricePerPiece / row.basePrice).toPrecision(2))
            : null;

        const product = await tx.product.create({
          data: {
            name: row.name,
            description: row.description || null,
            genericName: genericNames[i],
            imageUrl: imageUrls[i] ?? null,
            basePrice: row.basePrice,
            unit: row.unit,
            minOrderQty: 1,
            stepIncrement: 1,
            canSellByPiece: row.canSellByPiece ?? false,
            approxWeightPerPiece: computedApproxWeight,
            pricePerPiece: parsedPricePerPiece,
            isOrganic: row.isOrganic ?? false,
            isLocal: row.isLocal ?? false,
            isActive: true,
            vendorId: session.user.vendorId!,
            categoryId: row.categoryId,
            // Associer le produit à tous les marchés du vendeur
            ...(vendorMarkets.length > 0
              ? {
                  pricesByMarket: {
                    create: vendorMarkets.map((vm) => ({
                      marketId: vm.marketId,
                      price: null, // utilise basePrice par défaut
                      isAvailable: true,
                    })),
                  },
                  stocksByMarket: {
                    create: vendorMarkets.map((vm) => ({
                      marketId: vm.marketId,
                      quantity: null,
                      isUnlimited: true,
                    })),
                  },
                }
              : {}),
          },
        });

        created.push(product);
      }

      return created;
    });

    return NextResponse.json({
      created: createdProducts.length,
      errors,
    });
  } catch (error) {
    console.error("Error batch creating products:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des produits" },
      { status: 500 },
    );
  }
}

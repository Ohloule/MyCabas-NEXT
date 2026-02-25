import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// Unites valides (synchronisees avec le formulaire produit)
const VALID_UNITS = ["kg", "g", "litre", "piece", "botte", "lot", "barquette"];
const CONTINUOUS_UNITS = ["kg", "g", "litre"];

interface ParsedRow {
  rowNumber: number;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  basePrice: number;
  canSellByPiece: boolean;
  approxWeightPerPiece: number | null;
  pricePerPiece: number | null;
  isOrganic: boolean;
  isLocal: boolean;
  errors: string[];
  isValid: boolean;
}

interface ImportResult {
  rows: ParsedRow[];
  validCount: number;
  errorCount: number;
  categories: { name: string; id: string }[];
}

// Normaliser les valeurs booleennes
function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return ["oui", "yes", "true", "1", "o", "y"].includes(lower);
  }
  if (typeof value === "number") return value === 1;
  return false;
}

// Normaliser les prix
function parsePrice(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

// Normaliser un float optionnel
function parseOptionalFloat(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const normalized = trimmed.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

// Normaliser l'unite (gere les accents et synonymes)
function normalizeUnit(value: unknown): string {
  if (!value) return "";
  const raw = String(value).trim().toLowerCase();
  // Mapping synonymes
  const unitMap: Record<string, string> = {
    kg: "kg",
    kilogramme: "kg",
    g: "g",
    gramme: "g",
    litre: "litre",
    l: "litre",
    piece: "piece",
    "pièce": "piece",
    "piéce": "piece",
    botte: "botte",
    lot: "lot",
    barquette: "barquette",
  };
  return unitMap[raw] || raw;
}

// Traduire un texte FR → EN via MyMemory (gratuit, sans cle)
async function translateToEnglish(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return text;
    const data = (await res.json()) as {
      responseData?: { translatedText?: string };
    };
    const translated = data.responseData?.translatedText?.trim();
    return translated || text;
  } catch {
    return text;
  }
}

// Recuperer la premiere image Unsplash correspondant a une requete
async function fetchUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&content_filter=high&orientation=squarish`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: { urls?: { small?: string } }[];
    };
    return data.results?.[0]?.urls?.small ?? null;
  } catch {
    return null;
  }
}

// Parser le fichier Excel
async function parseExcelFile(buffer: ArrayBuffer): Promise<ParsedRow[]> {
  const workbook = XLSX.read(buffer, { type: "array" });

  // Chercher la feuille "Produits" ou utiliser la premiere feuille
  const sheetName = workbook.SheetNames.includes("Produits")
    ? "Produits"
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  // Colonnes : Nom | Description | Categorie | Unite | Prix de base | Vente a la piece | Poids approx. | Prix par piece | Bio | Local
  const jsonData = XLSX.utils.sheet_to_json(sheet, {
    header: [
      "name",
      "description",
      "category",
      "unit",
      "basePrice",
      "canSellByPiece",
      "approxWeightPerPiece",
      "pricePerPiece",
      "isOrganic",
      "isLocal",
    ],
    range: 1, // Ignorer la ligne d'en-tete
  }) as Record<string, unknown>[];

  const rows: ParsedRow[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const rowNumber = i + 2; // Numero Excel (1-indexed + en-tete)
    const errors: string[] = [];

    // Ignorer les lignes entierement vides
    if (!row.name && !row.category && !row.basePrice) {
      continue;
    }

    // --- Nom ---
    const name = String(row.name ?? "").trim();
    if (!name) {
      errors.push("Le nom est obligatoire");
    } else if (name.length > 100) {
      errors.push("Le nom ne doit pas depasser 100 caracteres");
    }

    // --- Description ---
    const description = row.description ? String(row.description).trim() : null;
    if (description && description.length > 500) {
      errors.push("La description ne doit pas depasser 500 caracteres");
    }

    // --- Categorie ---
    const category = String(row.category ?? "").trim();
    if (!category) {
      errors.push("La categorie est obligatoire");
    }

    // --- Unite ---
    const unit = normalizeUnit(row.unit);
    if (!unit) {
      errors.push("L'unite est obligatoire");
    } else if (!VALID_UNITS.includes(unit)) {
      errors.push(
        `Unite invalide "${String(row.unit).trim()}". Valeurs acceptees : ${VALID_UNITS.join(", ")}`,
      );
    }

    // --- Prix de base ---
    const basePrice = parsePrice(row.basePrice);
    if (basePrice === null) {
      errors.push("Le prix de base est obligatoire et doit etre un nombre");
    } else if (basePrice <= 0) {
      errors.push("Le prix de base doit etre superieur a 0");
    } else if (basePrice > 10000) {
      errors.push("Le prix semble trop eleve (max 10 000 EUR)");
    }

    // --- Vente a la piece ---
    const isContinuousUnit = CONTINUOUS_UNITS.includes(unit);
    const canSellByPiece = isContinuousUnit ? parseBoolean(row.canSellByPiece) : false;

    // --- Poids approx. par piece ---
    const approxWeightPerPiece = parseOptionalFloat(row.approxWeightPerPiece);

    // Unites discretes ou le poids est obligatoire (contenu variable)
    const WEIGHT_REQUIRED_UNITS = ["barquette", "lot"];

    // Validation conditionnelle du poids
    if (!isContinuousUnit && unit && WEIGHT_REQUIRED_UNITS.includes(unit)) {
      // barquette / lot : poids obligatoire
      if (approxWeightPerPiece === null) {
        errors.push(
          `Pour l'unite "${unit}", le poids/contenu approx. est obligatoire`,
        );
      } else if (approxWeightPerPiece <= 0) {
        errors.push("Le poids approx. doit etre superieur a 0");
      }
    } else if (!isContinuousUnit && unit && approxWeightPerPiece !== null && approxWeightPerPiece <= 0) {
      // piece / botte : poids optionnel mais si renseigne, doit etre > 0
      errors.push("Le poids approx. doit etre superieur a 0");
    } else if (canSellByPiece) {
      // Unite continue + vente a la piece : poids obligatoire
      if (approxWeightPerPiece === null) {
        errors.push(
          "Le poids approx. par piece est obligatoire si vente a la piece = Oui",
        );
      } else if (approxWeightPerPiece <= 0) {
        errors.push("Le poids approx. doit etre superieur a 0");
      }
    }

    // --- Prix par piece ---
    let pricePerPiece = parseOptionalFloat(row.pricePerPiece);

    // Auto-calcul du prix par piece si non fourni mais poids + prix de base presents
    if (
      canSellByPiece &&
      pricePerPiece === null &&
      approxWeightPerPiece !== null &&
      approxWeightPerPiece > 0 &&
      basePrice !== null &&
      basePrice > 0
    ) {
      pricePerPiece = Math.round(approxWeightPerPiece * basePrice * 100) / 100;
    }

    if (canSellByPiece && pricePerPiece !== null && pricePerPiece <= 0) {
      errors.push("Le prix par piece doit etre superieur a 0");
    }

    // --- Bio / Local ---
    const isOrganic = parseBoolean(row.isOrganic);
    const isLocal = parseBoolean(row.isLocal);

    rows.push({
      rowNumber,
      name,
      description,
      category,
      unit: unit || "kg",
      basePrice: basePrice ?? 0,
      canSellByPiece,
      approxWeightPerPiece,
      pricePerPiece,
      isOrganic,
      isLocal,
      errors,
      isValid: errors.length === 0,
    });
  }

  return rows;
}

// POST - Parser et previsualiser ou importer les produits
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const action = formData.get("action") as string; // "preview" ou "import"

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 },
      );
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      return NextResponse.json(
        { error: "Le fichier doit etre au format Excel (.xlsx ou .xls)" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const rows = await parseExcelFile(buffer);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Le fichier ne contient aucun produit" },
        { status: 400 },
      );
    }

    // Recuperer les categories pour validation
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
    });
    const categoryMap = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id]),
    );

    // Recuperer les produits existants du vendor pour detecter les doublons
    const existingProducts = await prisma.product.findMany({
      where: { vendorId: session.user.vendorId },
      select: { name: true },
    });
    const existingNames = new Set(
      existingProducts.map((p) => p.name.toLowerCase()),
    );

    // Valider categories et doublons avec la base
    for (const row of rows) {
      if (row.category && !categoryMap.has(row.category.toLowerCase())) {
        row.errors.push(`Categorie "${row.category}" introuvable`);
        row.isValid = false;
      }
      if (row.name && existingNames.has(row.name.toLowerCase())) {
        row.errors.push(`Un produit "${row.name}" existe deja`);
        row.isValid = false;
      }
    }

    // Detecter les doublons dans le fichier lui-meme
    const namesInFile = new Map<string, number>();
    for (const row of rows) {
      if (row.name) {
        const lowerName = row.name.toLowerCase();
        if (namesInFile.has(lowerName)) {
          row.errors.push(
            `Doublon avec la ligne ${namesInFile.get(lowerName)}`,
          );
          row.isValid = false;
        } else {
          namesInFile.set(lowerName, row.rowNumber);
        }
      }
    }

    const validRows = rows.filter((r) => r.isValid);
    const errorRows = rows.filter((r) => !r.isValid);

    // -- Mode previsualisation --
    if (action === "preview") {
      const result: ImportResult = {
        rows,
        validCount: validRows.length,
        errorCount: errorRows.length,
        categories: categories.map((c) => ({ name: c.name, id: c.id })),
      };
      return NextResponse.json(result);
    }

    // -- Mode import --
    if (action === "import") {
      if (validRows.length === 0) {
        return NextResponse.json(
          { error: "Aucun produit valide a importer" },
          { status: 400 },
        );
      }

      // Recuperer les images Unsplash avant la transaction (appels reseau hors TX)
      const imageUrls = await Promise.all(
        validRows.map(async (row) => {
          const englishName = await translateToEnglish(row.name);
          const imageUrl = await fetchUnsplashImage(englishName);
          return imageUrl;
        }),
      );

      const createdProducts = await prisma.$transaction(async (tx) => {
        const products = [];

        for (let i = 0; i < validRows.length; i++) {
          const row = validRows[i];
          const categoryId = categoryMap.get(row.category.toLowerCase());
          if (!categoryId) continue;

          const product = await tx.product.create({
            data: {
              name: row.name,
              description: row.description,
              imageUrl: imageUrls[i] ?? null,
              basePrice: row.basePrice,
              unit: row.unit,
              minOrderQty: 1,
              stepIncrement: 1,
              canSellByPiece: row.canSellByPiece,
              approxWeightPerPiece: row.approxWeightPerPiece,
              pricePerPiece: row.pricePerPiece,
              isOrganic: row.isOrganic,
              isLocal: row.isLocal,
              isActive: true,
              vendorId: session.user.vendorId!,
              categoryId,
            },
          });

          products.push(product);
        }

        return products;
      });

      return NextResponse.json({
        message: `${createdProducts.length} produit(s) importe(s) avec succes`,
        importedCount: createdProducts.length,
        skippedCount: errorRows.length,
      });
    }

    return NextResponse.json(
      { error: "Action invalide. Utilisez 'preview' ou 'import'" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import des produits" },
      { status: 500 },
    );
  }
}

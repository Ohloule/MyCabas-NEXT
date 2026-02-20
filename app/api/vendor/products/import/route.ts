import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// Unités valides (synchronisées avec le template)
const VALID_UNITS = ["kg", "g", "pièce", "botte", "litre", "cl", "barquette", "pot", "sachet", "bouteille"];

interface ParsedRow {
  rowNumber:   number;
  name:        string;
  description: string | null;
  category:    string;
  price:       number;
  unit:        string;
  moq:         number;
  isOrganic:   boolean;
  isLocal:     boolean;
  errors:      string[];
  isValid:     boolean;
}

interface ImportResult {
  rows:        ParsedRow[];
  validCount:  number;
  errorCount:  number;
  categories:  { name: string; id: string }[];
}

// Normaliser les valeurs booléennes
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

// Traduire un texte FR → EN via MyMemory (gratuit, sans clé)
async function translateToEnglish(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return text;
    const data = await res.json() as { responseData?: { translatedText?: string } };
    const translated = data.responseData?.translatedText?.trim();
    return translated || text;
  } catch {
    return text;
  }
}

// Récupérer la première image Unsplash correspondant à une requête
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
    const data = await res.json() as { results?: { urls?: { small?: string } }[] };
    return data.results?.[0]?.urls?.small ?? null;
  } catch {
    return null;
  }
}

// Normaliser le MOQ — retourne null si invalide, 1 si absent
function parseMOQ(value: unknown): number | null {
  // Cellule vide → défaut 1
  if (value === null || value === undefined || value === "") return 1;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return 1;
    const normalized = trimmed.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

// Parser le fichier Excel
async function parseExcelFile(buffer: ArrayBuffer): Promise<ParsedRow[]> {
  const workbook = XLSX.read(buffer, { type: "array" });

  // Chercher la feuille "Produits" ou utiliser la première feuille
  const sheetName = workbook.SheetNames.includes("Produits")
    ? "Produits"
    : workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  // Colonnes : Nom | Description | Catégorie | Prix | Unité | MOQ | Bio | Local
  const jsonData = XLSX.utils.sheet_to_json(sheet, {
    header: ["name", "description", "category", "price", "unit", "moq", "isOrganic", "isLocal"],
    range: 1, // Ignorer la ligne d'en-tête
  }) as Record<string, unknown>[];

  const rows: ParsedRow[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const rowNumber = i + 2; // Numéro Excel (1-indexed + en-tête)
    const errors: string[] = [];

    // Ignorer les lignes entièrement vides
    if (!row.name && !row.category && !row.price) {
      continue;
    }

    // --- Nom ---
    const name = String(row.name ?? "").trim();
    if (!name) {
      errors.push("Le nom est obligatoire");
    } else if (name.length > 100) {
      errors.push("Le nom ne doit pas dépasser 100 caractères");
    }

    // --- Description ---
    const description = row.description ? String(row.description).trim() : null;
    if (description && description.length > 500) {
      errors.push("La description ne doit pas dépasser 500 caractères");
    }

    // --- Catégorie ---
    const category = String(row.category ?? "").trim();
    if (!category) {
      errors.push("La catégorie est obligatoire");
    }

    // --- Prix ---
    const price = parsePrice(row.price);
    if (price === null) {
      errors.push("Le prix est obligatoire et doit être un nombre");
    } else if (price <= 0) {
      errors.push("Le prix doit être supérieur à 0");
    } else if (price > 10000) {
      errors.push("Le prix semble trop élevé (max 10 000 €)");
    }

    // --- Unité ---
    const unit = String(row.unit ?? "").trim().toLowerCase();
    if (!unit) {
      errors.push("L'unité est obligatoire");
    } else if (!VALID_UNITS.includes(unit)) {
      errors.push(`Unité invalide. Valeurs acceptées : ${VALID_UNITS.join(", ")}`);
    }

    // --- MOQ ---
    const moq = parseMOQ(row.moq);
    if (moq === null) {
      errors.push("Le MOQ doit être un nombre positif (ex: 0.5, 1, 2)");
    } else if (moq <= 0) {
      errors.push("Le MOQ doit être supérieur à 0");
    } else if (moq > 10000) {
      errors.push("Le MOQ semble trop élevé (max 10 000)");
    }

    // --- Bio / Local ---
    const isOrganic = parseBoolean(row.isOrganic);
    const isLocal   = parseBoolean(row.isLocal);

    rows.push({
      rowNumber,
      name,
      description,
      category,
      price:     price ?? 0,
      unit:      unit  || "kg",
      moq:       moq   ?? 1,
      isOrganic,
      isLocal,
      errors,
      isValid: errors.length === 0,
    });
  }

  return rows;
}

// POST - Parser et prévisualiser ou importer les produits
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file     = formData.get("file")   as File   | null;
    const action   = formData.get("action") as string;       // "preview" ou "import"

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      return NextResponse.json(
        { error: "Le fichier doit être au format Excel (.xlsx ou .xls)" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const rows   = await parseExcelFile(buffer);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Le fichier ne contient aucun produit" },
        { status: 400 }
      );
    }

    // Récupérer les catégories pour validation
    const categories    = await prisma.category.findMany({ select: { id: true, name: true } });
    const categoryMap   = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

    // Récupérer les produits existants du vendor pour détecter les doublons
    const existingProducts = await prisma.product.findMany({
      where:  { vendorId: session.user.vendorId },
      select: { name: true },
    });
    const existingNames = new Set(existingProducts.map((p) => p.name.toLowerCase()));

    // Valider catégories et doublons avec la base
    for (const row of rows) {
      if (row.category && !categoryMap.has(row.category.toLowerCase())) {
        row.errors.push(`Catégorie "${row.category}" introuvable`);
        row.isValid = false;
      }
      if (row.name && existingNames.has(row.name.toLowerCase())) {
        row.errors.push(`Un produit "${row.name}" existe déjà`);
        row.isValid = false;
      }
    }

    // Détecter les doublons dans le fichier lui-même
    const namesInFile = new Map<string, number>();
    for (const row of rows) {
      if (row.name) {
        const lowerName = row.name.toLowerCase();
        if (namesInFile.has(lowerName)) {
          row.errors.push(`Doublon avec la ligne ${namesInFile.get(lowerName)}`);
          row.isValid = false;
        } else {
          namesInFile.set(lowerName, row.rowNumber);
        }
      }
    }

    const validRows = rows.filter((r) => r.isValid);
    const errorRows = rows.filter((r) => !r.isValid);

    // ── Mode prévisualisation ──────────────────────────────────────
    if (action === "preview") {
      const result: ImportResult = {
        rows,
        validCount: validRows.length,
        errorCount: errorRows.length,
        categories: categories.map((c) => ({ name: c.name, id: c.id })),
      };
      return NextResponse.json(result);
    }

    // ── Mode import ───────────────────────────────────────────────
    if (action === "import") {
      if (validRows.length === 0) {
        return NextResponse.json(
          { error: "Aucun produit valide à importer" },
          { status: 400 }
        );
      }

      // Récupérer les images Unsplash avant la transaction (appels réseau hors TX)
      // Pour chaque produit : traduction FR→EN puis recherche Unsplash
      const imageUrls = await Promise.all(
        validRows.map(async (row) => {
          const englishName = await translateToEnglish(row.name);
          const imageUrl    = await fetchUnsplashImage(englishName);
          return imageUrl;
        })
      );

      const createdProducts = await prisma.$transaction(async (tx) => {
        const products = [];

        for (let i = 0; i < validRows.length; i++) {
          const row        = validRows[i];
          const categoryId = categoryMap.get(row.category.toLowerCase());
          if (!categoryId) continue;

          const product = await tx.product.create({
            data: {
              name:         row.name,
              description:  row.description,
              imageUrl:     imageUrls[i] ?? null,
              basePrice:    row.price,
              unit:         row.unit,
              minOrderQty:  row.moq,
              isOrganic:    row.isOrganic,
              isLocal:      row.isLocal,
              isActive:     true,
              vendorId:     session.user.vendorId!,
              categoryId,
            },
          });

          products.push(product);
        }

        return products;
      });

      return NextResponse.json({
        message:       `${createdProducts.length} produit(s) importé(s) avec succès`,
        importedCount: createdProducts.length,
        skippedCount:  errorRows.length,
      });
    }

    return NextResponse.json(
      { error: "Action invalide. Utilisez 'preview' ou 'import'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import des produits" },
      { status: 500 }
    );
  }
}

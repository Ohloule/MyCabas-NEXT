import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// Unités disponibles
const UNITS = ["kg", "g", "pièce", "botte", "litre", "cl", "barquette", "pot", "sachet", "bouteille"];

// GET - Générer et télécharger le template Excel
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les catégories
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // Créer le workbook
    const workbook = XLSX.utils.book_new();

    // ========== Feuille 1: Produits (template vide avec exemples) ==========
    const productsData = [
      // En-têtes
      ["Nom *", "Description", "Catégorie *", "Prix (€) *", "Unité *", "Bio", "Local"],
      // Exemples (commentés pour guider l'utilisateur)
      ["Tomates cerises", "Cultivées en plein champ, variété ancienne", "Fruits & Légumes", 4.50, "kg", "Oui", "Oui"],
      ["Pommes Gala", "Croquantes et sucrées", "Fruits & Légumes", 3.20, "kg", "Non", "Oui"],
      ["Miel de lavande", "Récolté en Provence", "Épicerie & Condiments", 12.00, "pot", "Oui", "Oui"],
    ];

    const productsSheet = XLSX.utils.aoa_to_sheet(productsData);

    // Définir les largeurs de colonnes
    productsSheet["!cols"] = [
      { wch: 25 }, // Nom
      { wch: 45 }, // Description
      { wch: 25 }, // Catégorie
      { wch: 12 }, // Prix
      { wch: 12 }, // Unité
      { wch: 8 },  // Bio
      { wch: 8 },  // Local
    ];

    XLSX.utils.book_append_sheet(workbook, productsSheet, "Produits");

    // ========== Feuille 2: Catégories (référence) ==========
    const categoriesData = [
      ["Catégories disponibles", "Description"],
      ...categories.map((cat) => [cat.name, cat.description || ""]),
    ];

    const categoriesSheet = XLSX.utils.aoa_to_sheet(categoriesData);
    categoriesSheet["!cols"] = [
      { wch: 30 },
      { wch: 50 },
    ];

    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Catégories");

    // ========== Feuille 3: Unités (référence) ==========
    const unitsData = [
      ["Unités disponibles"],
      ...UNITS.map((unit) => [unit]),
    ];

    const unitsSheet = XLSX.utils.aoa_to_sheet(unitsData);
    unitsSheet["!cols"] = [{ wch: 20 }];

    XLSX.utils.book_append_sheet(workbook, unitsSheet, "Unités");

    // ========== Feuille 4: Instructions ==========
    const instructionsData = [
      ["📋 INSTRUCTIONS POUR L'IMPORT DE PRODUITS"],
      [""],
      ["Comment remplir le fichier :"],
      [""],
      ["1. Allez dans l'onglet 'Produits'"],
      ["2. Supprimez les lignes d'exemple (lignes 2, 3 et 4)"],
      ["3. Remplissez vos produits à partir de la ligne 2"],
      [""],
      ["Colonnes obligatoires (marquées *) :"],
      ["  • Nom : Le nom de votre produit"],
      ["  • Catégorie : Doit correspondre exactement à une catégorie de l'onglet 'Catégories'"],
      ["  • Prix (€) : Le prix de base en euros (utilisez un point ou une virgule pour les décimales)"],
      ["  • Unité : Doit correspondre à une unité de l'onglet 'Unités'"],
      [""],
      ["Colonnes optionnelles :"],
      ["  • Description : Description du produit (max 500 caractères)"],
      ["  • Bio : 'Oui' ou 'Non' (par défaut: Non)"],
      ["  • Local : 'Oui' ou 'Non' (par défaut: Non)"],
      [""],
      ["⚠️ Attention :"],
      ["  • Ne modifiez pas la ligne d'en-tête (ligne 1)"],
      ["  • Les catégories doivent être écrites exactement comme dans l'onglet 'Catégories'"],
      ["  • Le prix doit être un nombre positif"],
      [""],
      ["Après l'import, vous pourrez ajuster les prix et stocks par marché depuis votre étal."],
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsSheet["!cols"] = [{ wch: 80 }];

    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

    // Générer le fichier Excel
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Retourner le fichier
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=template_produits_mycabas.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du template" },
      { status: 500 }
    );
  }
}

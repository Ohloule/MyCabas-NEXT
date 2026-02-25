import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

// Unites disponibles (synchronisees avec le formulaire produit)
const UNITS = ["kg", "g", "litre", "piece", "botte", "lot", "barquette"];

const UNIT_DESCRIPTIONS: Record<string, string> = {
  kg: "Kilogramme — ex: 1 kg de pommes (unite continue)",
  g: "Gramme — ex: 200g de fromage (unite continue)",
  litre: "Au litre — ex: 1L de lait (unite continue)",
  piece: "A la piece — ex: 1 artichaut (unite discrete)",
  botte: "A la botte — ex: 1 botte de radis (unite discrete)",
  lot: "Au lot — ex: 1 lot de 6 oeufs (unite discrete)",
  barquette: "A la barquette — ex: 1 barquette de fraises (unite discrete)",
};

// Helper : dataValidations existe en runtime mais est absent des types ExcelJS
function addValidation(
  sheet: ExcelJS.Worksheet,
  address: string,
  validation: ExcelJS.DataValidation,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (sheet as any).dataValidations.add(address, validation);
}

// Couleurs MyCabas
const GREEN_DARK = "FF1B4332";
const GREEN_LIGHT = "FFD8F3DC";
const GREY_LIGHT = "FFF3F4F6";
const WHITE = "FFFFFFFF";

// Nombre de lignes couvertes par les validations
const MAX_ROWS = 500;

// GET - Generer et telecharger le template Excel
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.vendorId) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "MyCabas";
    workbook.created = new Date();
    workbook.modified = new Date();

    // ================================================================
    // Feuille 1 : Produits (template principal)
    // Colonnes : Nom | Description | Categorie | Unite | Prix de base | Vente a la piece | Poids approx. | Prix par piece | Bio | Local
    // ================================================================
    const sheet = workbook.addWorksheet("Produits");

    // Figer la premiere ligne (en-tete toujours visible)
    sheet.views = [{ state: "frozen", ySplit: 1, activeCell: "A2" }];

    sheet.columns = [
      { key: "name", width: 28 },
      { key: "description", width: 45 },
      { key: "category", width: 28 },
      { key: "unit", width: 15 },
      { key: "basePrice", width: 16 },
      { key: "canSellByPiece", width: 18 },
      { key: "approxWeightPerPiece", width: 22 },
      { key: "pricePerPiece", width: 18 },
      { key: "isOrganic", width: 9 },
      { key: "isLocal", width: 9 },
    ];

    // --- En-tete ---
    const headerRow = sheet.addRow([
      "Nom *",
      "Description",
      "Categorie *",
      "Unite *",
      "Prix de base (EUR) *",
      "Vente a la piece",
      "Poids approx.",
      "Prix par piece (EUR)",
      "Bio",
      "Local",
    ]);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREEN_DARK },
      };
      cell.font = { bold: true, color: { argb: WHITE }, size: 11 };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: false,
      };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF40916C" } },
      };
    });

    // --- Lignes d'exemples (en gris, a supprimer avant import) ---
    const examples: (string | number)[][] = [
      [
        "Tomates cerises",
        "Cultivees en plein champ",
        "Fruits & Legumes",
        "kg",
        4.5,
        "Oui",
        0.15,
        0.68,
        "Oui",
        "Oui",
      ],
      [
        "Pommes Gala",
        "Croquantes et sucrees",
        "Fruits & Legumes",
        "kg",
        3.2,
        "Oui",
        0.18,
        0.58,
        "Non",
        "Oui",
      ],
      [
        "Barquette de fraises",
        "Fraises de saison 500g",
        "Fruits & Legumes",
        "barquette",
        5.0,
        "",
        500,
        "",
        "Oui",
        "Oui",
      ],
      [
        "Miel de lavande",
        "Recolte en Provence",
        "Epicerie & Condiments",
        "pot",
        12.0,
        "",
        "",
        "",
        "Oui",
        "Oui",
      ],
    ];

    examples.forEach((example) => {
      const row = sheet.addRow(example);
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: GREY_LIGHT },
        };
        cell.font = { italic: true, color: { argb: "FF9CA3AF" } };
      });
    });

    // ================================================================
    // Validations de donnees (dropdowns + regles numeriques)
    // ================================================================
    const catLastRow = categories.length + 1;

    // Colonne C — Categorie (dropdown depuis la feuille Categories)
    addValidation(sheet, `C2:C${MAX_ROWS}`, {
      type: "list",
      allowBlank: false,
      formulae: [`'Categories'!$A$2:$A$${catLastRow}`],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Categorie invalide",
      error:
        "Veuillez selectionner une categorie dans la liste deroulante.",
    });

    // Colonne D — Unite (dropdown liste fixe)
    addValidation(sheet, `D2:D${MAX_ROWS}`, {
      type: "list",
      allowBlank: false,
      formulae: [`"${UNITS.join(",")}"`],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Unite invalide",
      error: `Unites acceptees : ${UNITS.join(", ")}`,
    });

    // Colonne E — Prix de base (nombre decimal > 0)
    addValidation(sheet, `E2:E${MAX_ROWS}`, {
      type: "decimal",
      operator: "greaterThan",
      allowBlank: false,
      formulae: [0],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Prix invalide",
      error: "Le prix doit etre un nombre positif superieur a 0 (ex: 4.50).",
    });

    // Colonne F — Vente a la piece (dropdown Oui/Non)
    addValidation(sheet, `F2:F${MAX_ROWS}`, {
      type: "list",
      allowBlank: true,
      formulae: ['"Oui,Non"'],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Valeur invalide",
      error: 'Selectionnez "Oui" ou "Non".',
    });

    // Colonne G — Poids approx. (nombre decimal > 0)
    addValidation(sheet, `G2:G${MAX_ROWS}`, {
      type: "decimal",
      operator: "greaterThan",
      allowBlank: true,
      formulae: [0],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Poids invalide",
      error: "Le poids doit etre un nombre positif (ex: 0.150 pour 150g).",
    });

    // Colonne H — Prix par piece (nombre decimal > 0)
    addValidation(sheet, `H2:H${MAX_ROWS}`, {
      type: "decimal",
      operator: "greaterThan",
      allowBlank: true,
      formulae: [0],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Prix invalide",
      error: "Le prix par piece doit etre un nombre positif.",
    });

    // Colonne I — Bio (dropdown Oui/Non)
    addValidation(sheet, `I2:I${MAX_ROWS}`, {
      type: "list",
      allowBlank: true,
      formulae: ['"Oui,Non"'],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Valeur invalide",
      error: 'Selectionnez "Oui" ou "Non".',
    });

    // Colonne J — Local (dropdown Oui/Non)
    addValidation(sheet, `J2:J${MAX_ROWS}`, {
      type: "list",
      allowBlank: true,
      formulae: ['"Oui,Non"'],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle: "Valeur invalide",
      error: 'Selectionnez "Oui" ou "Non".',
    });

    // ================================================================
    // Feuille 2 : Categories (reference pour le dropdown colonne C)
    // ================================================================
    const catSheet = workbook.addWorksheet("Categories");
    catSheet.columns = [
      { key: "name", width: 35 },
      { key: "desc", width: 55 },
    ];

    const catHeader = catSheet.addRow(["Categories disponibles", "Description"]);
    catHeader.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREEN_LIGHT },
      };
      cell.font = { bold: true, size: 11 };
    });

    categories.forEach((cat) => {
      catSheet.addRow({ name: cat.name, desc: cat.description ?? "" });
    });

    // ================================================================
    // Feuille 3 : Unites (reference informative)
    // ================================================================
    const unitsSheet = workbook.addWorksheet("Unites");
    unitsSheet.columns = [
      { key: "unit", width: 15 },
      { key: "type", width: 15 },
      { key: "desc", width: 55 },
    ];

    const unitHeader = unitsSheet.addRow([
      "Unite",
      "Type",
      "Exemple d'utilisation",
    ]);
    unitHeader.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: GREEN_LIGHT },
      };
      cell.font = { bold: true, size: 11 };
    });

    const CONTINUOUS = ["kg", "g", "litre"];
    UNITS.forEach((unit) => {
      unitsSheet.addRow({
        unit,
        type: CONTINUOUS.includes(unit) ? "Continue" : "Discrete",
        desc: UNIT_DESCRIPTIONS[unit] ?? "",
      });
    });

    // ================================================================
    // Feuille 4 : Instructions
    // ================================================================
    const instrSheet = workbook.addWorksheet("Instructions");
    instrSheet.columns = [{ key: "text", width: 100 }];

    type InstrLine = { text: string; bold?: true; size?: number };
    const lines: InstrLine[] = [
      {
        text: "INSTRUCTIONS — IMPORT DE PRODUITS MYCABAS",
        bold: true,
        size: 14,
      },
      { text: "" },
      { text: "DESCRIPTION DES COLONNES", bold: true },
      { text: "" },
      {
        text: "A  Nom *                   Nom du produit (obligatoire, max 100 caracteres)",
      },
      {
        text: "B  Description             Description libre (optionnelle, max 500 caracteres)",
      },
      {
        text: "C  Categorie *             Liste deroulante — choisir dans l'onglet « Categories »",
      },
      {
        text: "D  Unite *                 Liste deroulante — kg, g, litre (continues) ou piece, botte, lot, barquette (discretes)",
      },
      {
        text: "E  Prix de base (EUR) *    Prix de reference en euros (ex: 4.50 EUR/kg)",
      },
      {
        text: 'F  Vente a la piece        "Oui" ou "Non" — uniquement pour les unites CONTINUES (kg, g, litre)',
      },
      {
        text: "G  Poids approx.           Poids approx. par piece en unite du produit (ex: 0.150 kg pour une pomme)",
      },
      {
        text: "                           Pour les unites DISCRETES : poids/contenu en grammes (ex: 500 pour une barquette de 500g)",
      },
      {
        text: "H  Prix par piece (EUR)    Prix affiche par piece — auto-calcule si vide (poids x prix de base)",
      },
      {
        text: 'I  Bio                     "Oui" ou "Non" (defaut: Non)',
      },
      {
        text: 'J  Local                   "Oui" ou "Non" (defaut: Non)',
      },
      { text: "" },
      { text: "REGLES IMPORTANTES", bold: true },
      { text: "" },
      {
        text: "UNITES CONTINUES (kg, g, litre) :",
        bold: true,
      },
      {
        text: "  - Le poids approx. (col G) n'est requis QUE si « Vente a la piece » = Oui",
      },
      {
        text: "  - Si vous renseignez le poids et le prix de base, le prix par piece est calcule automatiquement",
      },
      {
        text: '  - Exemple : Pommes a 3.20 EUR/kg, vente a la piece = Oui, poids = 0.180 kg → prix par piece = 0.58 EUR',
      },
      { text: "" },
      {
        text: "UNITES DISCRETES (piece, botte, lot, barquette) :",
        bold: true,
      },
      {
        text: "  - Pour « barquette » et « lot » : le poids/contenu approx. (col G) est OBLIGATOIRE (en grammes)",
      },
      {
        text: "  - Pour « piece » et « botte » : le poids approx. est optionnel",
      },
      {
        text: '  - La colonne « Vente a la piece » est ignoree pour les unites discretes',
      },
      {
        text: "  - Exemple : Barquette de fraises → unite = barquette, poids approx. = 500 (grammes)",
      },
      { text: "" },
      { text: "COMMENT REMPLIR", bold: true },
      { text: "" },
      { text: "1.  Allez dans l'onglet « Produits »" },
      {
        text: "2.  Supprimez les lignes d'exemples en gris (lignes 2 a 5)",
      },
      { text: "3.  Saisissez vos produits a partir de la ligne 2" },
      {
        text: "4.  Utilisez les listes deroulantes pour Categorie, Unite, Bio et Local",
      },
      { text: "" },
      { text: "POINTS D'ATTENTION", bold: true },
      { text: "" },
      { text: "  - Ne supprimez pas la ligne 1 (en-tetes)" },
      {
        text: "  - Les listes deroulantes ne sont pas modifiables",
      },
      {
        text: "  - Le prix de base et le poids doivent etre des nombres positifs",
      },
      { text: "" },
      {
        text: "Apres l'import, ajustez les prix et stocks par marche depuis votre tableau de bord.",
      },
    ];

    lines.forEach((line) => {
      const row = instrSheet.addRow([line.text]);
      if (line.bold || line.size) {
        row.getCell(1).font = {
          bold: !!line.bold,
          size: line.size ?? 11,
        };
      }
    });

    // ================================================================
    // Activer l'onglet Produits a l'ouverture
    // ================================================================
    workbook.views = [
      {
        activeTab: 0,
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        visibility: "visible",
      },
    ];

    // Generer le buffer et retourner la reponse
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          "attachment; filename=template_produits_mycabas.xlsx",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du template" },
      { status: 500 },
    );
  }
}

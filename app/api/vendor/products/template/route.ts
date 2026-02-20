import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import ExcelJS from "exceljs";

// Unités disponibles
const UNITS = ["kg", "g", "pièce", "botte", "litre", "cl", "barquette", "pot", "sachet", "bouteille"];

const UNIT_DESCRIPTIONS: Record<string, string> = {
  kg:         "Kilogramme — ex: 1 kg de pommes",
  g:          "Gramme — ex: 200g de fromage",
  pièce:      "À la pièce — ex: 1 artichaut",
  botte:      "À la botte — ex: 1 botte de radis",
  litre:      "Au litre — ex: 1L de lait",
  cl:         "Centilitre — ex: 25cl de crème",
  barquette:  "À la barquette — ex: 1 barquette de fraises",
  pot:        "Au pot — ex: 1 pot de miel",
  sachet:     "Au sachet — ex: 1 sachet de graines",
  bouteille:  "À la bouteille — ex: 1 bouteille d'huile",
};

// Helper : dataValidations existe en runtime mais est absent des types ExcelJS
function addValidation(sheet: ExcelJS.Worksheet, address: string, validation: ExcelJS.DataValidation) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (sheet as any).dataValidations.add(address, validation);
}

// Couleurs MyCabas
const GREEN_DARK  = "FF1B4332";
const GREEN_LIGHT = "FFD8F3DC";
const GREY_LIGHT  = "FFF3F4F6";
const WHITE       = "FFFFFFFF";

// Nombre de lignes couvertes par les validations
const MAX_ROWS = 500;

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

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator  = "MyCabas";
    workbook.created  = new Date();
    workbook.modified = new Date();

    // ================================================================
    // Feuille 1 : Produits (template principal)
    // Colonnes : Nom | Description | Catégorie | Prix | Unité | MOQ | Bio | Local
    // ================================================================
    const sheet = workbook.addWorksheet("Produits");

    // Figer la première ligne (en-tête toujours visible)
    sheet.views = [{ state: "frozen", ySplit: 1, activeCell: "A2" }];

    sheet.columns = [
      { key: "name",        width: 28 },
      { key: "description", width: 45 },
      { key: "category",    width: 28 },
      { key: "price",       width: 13 },
      { key: "unit",        width: 15 },
      { key: "moq",         width: 15 },
      { key: "isOrganic",   width: 9  },
      { key: "isLocal",     width: 9  },
    ];

    // --- En-tête ---
    const headerRow = sheet.addRow([
      "Nom *",
      "Description",
      "Catégorie *",
      "Prix (€) *",
      "Unité *",
      "MOQ *",
      "Bio",
      "Local",
    ]);
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_DARK } };
      cell.font      = { bold: true, color: { argb: WHITE }, size: 11 };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
      cell.border    = { bottom: { style: "medium", color: { argb: "FF40916C" } } };
    });

    // --- Lignes d'exemples (en gris, à supprimer avant import) ---
    const examples: (string | number)[][] = [
      ["Tomates cerises", "Cultivées en plein champ, variété ancienne", "Fruits & Légumes",       4.50,  "kg",        0.5, "Oui", "Oui"],
      ["Pommes Gala",     "Croquantes et sucrées",                      "Fruits & Légumes",       3.20,  "kg",        1,   "Non", "Oui"],
      ["Miel de lavande", "Récolté en Provence",                        "Épicerie & Condiments",  12.00, "pot",       1,   "Oui", "Oui"],
    ];

    examples.forEach((example) => {
      const row = sheet.addRow(example);
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY_LIGHT } };
        cell.font = { italic: true, color: { argb: "FF9CA3AF" } };
      });
    });

    // ================================================================
    // Validations de données (dropdowns + règles numériques)
    // ================================================================
    const catLastRow = categories.length + 1; // +1 car l'en-tête est en ligne 1

    // Colonne C — Catégorie (dropdown depuis la feuille Catégories)
    addValidation(sheet, `C2:C${MAX_ROWS}`, {
      type:            "list",
      allowBlank:      false,
      formulae:        [`'Catégories'!$A$2:$A$${catLastRow}`],
      showErrorMessage: true,
      errorStyle:      "error",
      errorTitle:      "Catégorie invalide",
      error:           "Veuillez sélectionner une catégorie dans la liste déroulante.",
    });

    // Colonne D — Prix (nombre décimal > 0)
    addValidation(sheet, `D2:D${MAX_ROWS}`, {
      type:            "decimal",
      operator:        "greaterThan",
      allowBlank:      false,
      formulae:        [0],
      showErrorMessage: true,
      errorStyle:      "error",
      errorTitle:      "Prix invalide",
      error:           "Le prix doit être un nombre positif supérieur à 0 (ex: 4.50).",
    });

    // Colonne E — Unité (dropdown liste fixe, non modifiable)
    addValidation(sheet, `E2:E${MAX_ROWS}`, {
      type:            "list",
      allowBlank:      false,
      formulae:        [`"${UNITS.join(",")}"`],
      showErrorMessage: true,
      errorStyle:      "error",
      errorTitle:      "Unité invalide",
      error:           `Unités acceptées : ${UNITS.join(", ")}`,
    });

    // Colonne F — MOQ (nombre décimal > 0, facultatif → défaut 1)
    addValidation(sheet, `F2:F${MAX_ROWS}`, {
      type:            "decimal",
      operator:        "greaterThan",
      allowBlank:      true,
      formulae:        [0],
      showErrorMessage: true,
      errorStyle:      "error",
      errorTitle:      "MOQ invalide",
      error:           "La quantité minimum doit être un nombre positif (ex: 0.5, 1, 2). Laissez vide pour 1 par défaut.",
    });

    // Colonne G — Bio (dropdown Oui/Non)
    addValidation(sheet, `G2:G${MAX_ROWS}`, {
      type:            "list",
      allowBlank:      true,
      formulae:        ['"Oui,Non"'],
      showErrorMessage: true,
      errorStyle:      "error",
      errorTitle:      "Valeur invalide",
      error:           'Sélectionnez "Oui" ou "Non" dans la liste déroulante.',
    });

    // Colonne H — Local (dropdown Oui/Non)
    addValidation(sheet, `H2:H${MAX_ROWS}`, {
      type:            "list",
      allowBlank:      true,
      formulae:        ['"Oui,Non"'],
      showErrorMessage: true,
      errorStyle:      "error",
      errorTitle:      "Valeur invalide",
      error:           'Sélectionnez "Oui" ou "Non" dans la liste déroulante.',
    });

    // ================================================================
    // Feuille 2 : Catégories (référence pour le dropdown colonne C)
    // ================================================================
    const catSheet = workbook.addWorksheet("Catégories");
    catSheet.columns = [
      { key: "name", width: 35 },
      { key: "desc", width: 55 },
    ];

    const catHeader = catSheet.addRow(["Catégories disponibles", "Description"]);
    catHeader.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_LIGHT } };
      cell.font = { bold: true, size: 11 };
    });

    categories.forEach((cat) => {
      catSheet.addRow({ name: cat.name, desc: cat.description ?? "" });
    });

    // ================================================================
    // Feuille 3 : Unités (référence informative)
    // ================================================================
    const unitsSheet = workbook.addWorksheet("Unités");
    unitsSheet.columns = [
      { key: "unit", width: 15 },
      { key: "desc", width: 55 },
    ];

    const unitHeader = unitsSheet.addRow(["Unité", "Exemple d'utilisation"]);
    unitHeader.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN_LIGHT } };
      cell.font = { bold: true, size: 11 };
    });

    UNITS.forEach((unit) => {
      unitsSheet.addRow({ unit, desc: UNIT_DESCRIPTIONS[unit] ?? "" });
    });

    // ================================================================
    // Feuille 4 : Instructions
    // ================================================================
    const instrSheet = workbook.addWorksheet("Instructions");
    instrSheet.columns = [{ key: "text", width: 95 }];

    type InstrLine = { text: string; bold?: true; size?: number };
    const lines: InstrLine[] = [
      { text: "📋  INSTRUCTIONS — IMPORT DE PRODUITS MYCABAS", bold: true, size: 14 },
      { text: "" },
      { text: "DESCRIPTION DES COLONNES", bold: true },
      { text: "" },
      { text: "A  Nom *              Nom du produit (obligatoire, max 100 caractères)" },
      { text: "B  Description        Description libre (optionnelle, max 500 caractères)" },
      { text: "C  Catégorie *        Liste déroulante — choisir dans l'onglet « Catégories »" },
      { text: "D  Prix (€) *         Prix de base en euros (ex: 4.50)" },
      { text: "E  Unité *            Liste déroulante — choisir dans l'onglet « Unités »" },
      { text: "F  MOQ *              Quantité minimum de commande (défaut: 1 si vide)" },
      { text: "G  Bio                « Oui » ou « Non » via liste déroulante (défaut: Non)" },
      { text: "H  Local              « Oui » ou « Non » via liste déroulante (défaut: Non)" },
      { text: "" },
      { text: "COMMENT REMPLIR", bold: true },
      { text: "" },
      { text: "1.  Allez dans l'onglet « Produits »" },
      { text: "2.  Supprimez les 3 lignes d'exemples en gris (lignes 2, 3, 4)" },
      { text: "3.  Saisissez vos produits à partir de la ligne 2" },
      { text: "4.  Utilisez les listes déroulantes pour Catégorie, Unité, Bio et Local" },
      { text: "" },
      { text: "MOQ — QUANTITÉ MINIMUM DE COMMANDE", bold: true },
      { text: "" },
      { text: "Le MOQ (Minimum Order Quantity) est la plus petite quantité commandable par un client." },
      { text: "Exemples :" },
      { text: "  • Vendu au kg, minimum 500g  →  MOQ = 0.5" },
      { text: "  • Vendu à la pièce, min 1    →  MOQ = 1" },
      { text: "  • Vendu au kg, minimum 2 kg  →  MOQ = 2" },
      { text: "  • Laissez vide pour appliquer le défaut de 1" },
      { text: "" },
      { text: "⚠️  POINTS D'ATTENTION", bold: true },
      { text: "" },
      { text: "  • Ne supprimez pas la ligne 1 (en-têtes)" },
      { text: "  • Les listes déroulantes ne sont pas modifiables — utilisez uniquement les valeurs proposées" },
      { text: "  • Le prix et le MOQ doivent être des nombres positifs" },
      { text: "" },
      { text: "Après l'import, ajustez les prix et stocks par marché depuis votre tableau de bord." },
    ];

    lines.forEach((line) => {
      const row = instrSheet.addRow([line.text]);
      if (line.bold || line.size) {
        row.getCell(1).font = { bold: !!line.bold, size: line.size ?? 11 };
      }
    });

    // ================================================================
    // Activer l'onglet Produits à l'ouverture
    // ================================================================
    workbook.views = [{ activeTab: 0, x: 0, y: 0, width: 10000, height: 20000, firstSheet: 0, visibility: "visible" }];

    // Générer le buffer et retourner la réponse
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

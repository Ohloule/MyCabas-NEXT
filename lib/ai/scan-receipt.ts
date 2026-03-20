import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface ReceiptProduct {
  receiptName: string;
  genericName: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  unitPrice: number | null;
}

export interface ReceiptScanResult {
  storeName: string | null;
  date: string | null;
  products: ReceiptProduct[];
  totalAmount: number | null;
}

export async function scanReceipt(
  base64Image: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<ReceiptScanResult | null> {
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Tu es un assistant expert dans la lecture et l'interprétation de tickets de caisse de supermarchés français.

Analyse cette photo de ticket de caisse et extrais les informations suivantes au format JSON.

CATÉGORIES DISPONIBLES (utilise exactement ces noms) :
- Fruits & Légumes
- Viandes & Charcuterie
- Poissons & Fruits de mer
- Fromages & Produits laitiers
- Boulangerie & Pâtisserie
- Épicerie & Condiments
- Boissons
- Bio & Nature
- Autre

FORMAT DE RÉPONSE (JSON uniquement, sans markdown, sans backticks) :
{
  "storeName": "nom du magasin ou null",
  "date": "date au format JJ/MM/AAAA ou null",
  "products": [
    {
      "receiptName": "nom exactement comme imprimé sur le ticket",
      "genericName": "NOM GÉNÉRIQUE EN MAJUSCULES (1-3 mots)",
      "category": "une des catégories ci-dessus",
      "quantity": 1,
      "unit": "kg ou L ou pièce ou tranche",
      "price": 2.49,
      "unitPrice": 4.98
    }
  ],
  "totalAmount": 45.67
}

RÈGLES GÉNÉRALES :
- Inclus UNIQUEMENT les produits alimentaires
- Ignore les produits non alimentaires (sacs, produits ménagers, hygiène, etc.)
- Ignore les lignes de remise/réduction, mais déduis-les du prix si possible
- price = prix total payé pour cet article (après remise éventuelle)
- Pour genericName, utilise le nom courant en français en majuscules (POMME, TOMATE, LAIT, BEURRE, etc.)
- Si tu ne peux pas lire le ticket, renvoie : {"storeName": null, "date": null, "products": [], "totalAmount": null}

UNITÉS PRÉFÉRÉES — Utilise TOUJOURS les unités principales, JAMAIS les sous-unités :
- Poids : TOUJOURS en kg (jamais en g). Convertis : 250g → 0.250 kg, 500g → 0.500 kg, 125g → 0.125 kg
- Volume : TOUJOURS en L (jamais en mL ou cL). Convertis : 500mL → 0.5 L, 33cL → 0.33 L, 75cL → 0.75 L
- Comptage : "pièce" ou "tranche" selon le contexte

RÈGLES POUR LES QUANTITÉS — C'est CRUCIAL, sois très attentif et méthodique :

ÉTAPE 1 - Détecte le nombre d'exemplaires achetés :
- AVANT d'analyser le nom du produit, regarde si le ticket indique un multiplicateur sur la ligne ou la ligne juste au-dessus/en-dessous.
- Les tickets affichent souvent "4 x 3.17" ou "QTE: 4" ou simplement un chiffre avant le prix, ce qui signifie que le client a acheté PLUSIEURS exemplaires du même article.
- C'est une information DISTINCTE du contenu du produit (nombre de bouteilles dans un pack, nombre de tranches, etc.)

ÉTAPE 2 - Décrypte le contenu du produit depuis son nom abrégé :
- Les noms sur les tickets sont très abrégés. Décrypte les abréviations pour trouver le poids, le volume ou le nombre d'unités PAR article.
- Indices de poids : "250G" → 0.250 kg, "500G" → 0.500 kg, "1KG" → 1 kg
  Exemple : "BEURRE BEUR.TEND.S.GUE.80€ EAU 60250G" → "250G" = plaquette de 0.250 kg
- Indices de tranches/portions : "4T" = 4 tranches, "6T" = 6 tranches, "2P" = 2 pièces
  Exemple : "JAMBON A L'ETOUFFEE 4T" → c'est du jambon en tranches, "4T" = 4 tranches
- Indices de volume pour les boissons : "6X1.5L" = pack de 6 bouteilles de 1.5L = 9L
  Exemple : "EVIAN 6X1.5L" → 6 × 1.5L = 9L par pack

ÉTAPE 3 - Calcule la quantité TOTALE en combinant les deux :
- quantity = (nombre d'exemplaires achetés) × (contenu par exemplaire)
- IMPORTANT : convertis toujours dans l'unité principale (kg ou L)
  Exemple complet : le ticket indique "4 x 3.17" pour "CRISTALINE 6X1.5L" à 12.68€
  → 4 packs achetés × 6 bouteilles × 1.5L = 36L total
  → quantity=36, unit="L", price=12.68, unitPrice=12.68/36=0.35
  Autre exemple : "BEURRE 250G" à 3.09€, 1 seul acheté
  → quantity=0.250, unit="kg", price=3.09, unitPrice=3.09/0.250=12.36
- Si aucun indice de quantité n'est trouvé, mets quantity=1 et unit="pièce"

RÈGLES POUR LE PRIX UNITAIRE :
- unitPrice = prix rapporté à l'unité principale : €/kg, €/L, €/pièce, ou €/tranche
- Si le ticket affiche directement un prix au kg ou au L, utilise-le
- Sinon, calcule-le : unitPrice = price / quantity (arrondi à 2 décimales)
- Vérifie la cohérence : un prix au kg de beurre autour de 10-15€/kg est normal, 0.01€/g ne l'est pas !
- Si le calcul n'est pas possible, mets null`,
            },
          ],
        },
      ],
    });

    const text = (message.content[0] as { type: string; text: string }).text.trim();

    // Parse JSON - handle possible markdown wrapping
    let jsonStr = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const result = JSON.parse(jsonStr) as ReceiptScanResult;

    // Validate structure
    if (!result.products || !Array.isArray(result.products)) {
      return { storeName: null, date: null, products: [], totalAmount: null };
    }

    return result;
  } catch (error) {
    console.error("Erreur scan ticket de caisse:", error);
    return null;
  }
}

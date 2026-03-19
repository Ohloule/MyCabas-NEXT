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
              text: `Tu es un assistant spécialisé dans la lecture de tickets de caisse de supermarchés français.

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
      "unit": "kg ou pièce ou L",
      "price": 2.49,
      "unitPrice": 4.98
    }
  ],
  "totalAmount": 45.67
}

RÈGLES :
- Inclus UNIQUEMENT les produits alimentaires
- Ignore les produits non alimentaires (sacs, produits ménagers, hygiène, etc.)
- Ignore les lignes de remise/réduction, mais déduis-les du prix si possible
- Si la quantité n'est pas indiquée, mets 1
- unitPrice = prix au kg/L si indiqué sur le ticket, sinon null
- price = prix total payé pour cet article (après remise éventuelle)
- Pour genericName, utilise le nom courant en français en majuscules (POMME, TOMATE, LAIT, BEURRE, etc.)
- Si tu ne peux pas lire le ticket, renvoie : {"storeName": null, "date": null, "products": [], "totalAmount": null}`,
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

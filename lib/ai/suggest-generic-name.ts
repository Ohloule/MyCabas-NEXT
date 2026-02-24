import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function suggestGenericName(
  productName: string,
  categoryName: string
): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: `Tu es un assistant pour un marché de producteurs français.
Donne uniquement le nom générique du produit en MAJUSCULES (1 à 3 mots max, sans ponctuation).

Exemples :
- "Pink Lady bio calibre 6" (Fruits & Légumes) → POMME
- "Comté AOP 18 mois affiné" (Fromages & Produits laitiers) → COMTÉ
- "Filet de saumon sauvage Atlantique" (Poissons & Fruits de mer) → SAUMON
- "Baguette tradition au levain" (Boulangerie & Pâtisserie) → PAIN
- "Poulet fermier Label Rouge entier" (Viandes & Charcuterie) → POULET
- "Tomates cerises grappe" (Fruits & Légumes) → TOMATE CERISE
- "Lait entier cru de ferme" (Fromages & Produits laitiers) → LAIT

Produit : "${productName}"
Catégorie : "${categoryName}"
Réponse (uniquement le nom générique) :`,
        },
      ],
    });

    const text = (message.content[0] as { text: string }).text
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŒÆÇ\s-]/g, "")
      .trim();

    return text || null;
  } catch (error) {
    console.error("Erreur suggestion genericName:", error);
    return null; // Non bloquant : le produit est sauvegardé sans genericName
  }
}

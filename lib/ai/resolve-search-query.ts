import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

/**
 * Résout une requête utilisateur en nom générique de produit pour la recherche.
 * Ex : "pink lady bio" → "POMME", "tomates cerises" → "TOMATE CERISE"
 * Retourne null si la requête ne correspond pas à un produit alimentaire.
 */
export async function resolveSearchQuery(query: string): Promise<string | null> {
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 20,
      messages: [
        {
          role: "user",
          content: `Tu es un assistant de recherche pour un marché de producteurs français.
L'utilisateur tape une recherche. Donne le nom générique normalisé du produit en MAJUSCULES (1 à 3 mots max, sans ponctuation).

Exemples :
- "pink lady" → POMME
- "pink lady bio" → POMME
- "tomates cerises" → TOMATE CERISE
- "saumon fumé" → SAUMON
- "yaourt nature" → YAOURT
- "camembert normand" → CAMEMBERT
- "poulet fermier" → POULET
- "fraises gariguette" → FRAISE
- "baguette tradition" → PAIN
- "comté 18 mois" → COMTÉ

Si la recherche ne correspond pas à un produit alimentaire (ex: nom de commerçant, code postal, mot vide), réponds exactement par: NULL

Recherche : "${query}"
Réponse (nom générique ou NULL) :`,
        },
      ],
    });

    const text = (message.content[0] as { text: string }).text
      .trim()
      .toUpperCase()
      .replace(/[^A-ZÀÂÄÉÈÊËÎÏÔÙÛÜŒÆÇ\s-]/g, "")
      .trim();

    if (!text || text === "NULL") return null;
    return text;
  } catch (error) {
    console.error("Erreur resolveSearchQuery:", error);
    return null; // Non bloquant : on continue avec la requête originale
  }
}

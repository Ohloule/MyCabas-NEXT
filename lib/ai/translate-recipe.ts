import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

/** Extrait le JSON pur d'une réponse qui peut contenir des blocs markdown ```json ``` */
function extractJson(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

/**
 * Traduit une requête de recherche du français vers l'anglais pour Spoonacular.
 * Ex: "poulet rôti" → "roast chicken", "tarte aux pommes" → "apple pie"
 * Si déjà en anglais, retourne tel quel.
 */
export async function translateQueryToEnglish(query: string): Promise<string> {
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: `Traduis cette recherche de recette en anglais. Réponds UNIQUEMENT avec la traduction, sans guillemets, sans explication. Si c'est déjà en anglais, réponds tel quel.

Recherche : "${query}"`,
        },
      ],
    });

    const text = (message.content[0] as { text: string }).text.trim();
    return text || query;
  } catch (error) {
    console.error("Erreur traduction requête:", error);
    return query; // Fallback : on envoie la requête originale
  }
}

/**
 * Traduit un objet recette (titre, résumé, ingrédients, instructions) en français.
 * Utilise un seul appel Haiku pour tout traduire d'un coup.
 */
export async function translateRecipeDetail(recipe: {
  title: string;
  summary: string;
  ingredients: Array<{ original: string; name: string }>;
  instructions: Array<{ step: string }>;
}): Promise<{
  title: string;
  summary: string;
  ingredients: Array<{ original: string; name: string }>;
  instructions: Array<{ step: string }>;
}> {
  try {
    const payload = {
      title: recipe.title,
      summary: recipe.summary,
      ingredients: recipe.ingredients.map((i) => ({
        original: i.original,
        name: i.name,
      })),
      instructions: recipe.instructions.map((s) => s.step),
    };

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Traduis cette recette en français. Réponds UNIQUEMENT avec le JSON traduit, sans markdown, sans explication.

Règles :
- Traduis le titre, le résumé, chaque ingrédient (original ET name), et chaque instruction
- Pour le résumé ("summary"), réécris-le en français de manière appétissante et engageante, qui donne envie de cuisiner et de goûter le plat. 2-3 phrases max.
- Pour les ingrédients, "name" doit être le nom simple de l'ingrédient en français (ex: "tomato" → "tomate")
- Pour "original", traduis la description complète (ex: "2 large tomatoes, diced" → "2 grosses tomates, coupées en dés")
- Convertis les unités en système métrique : cups/oz/lbs → g ou mL, tbsp → cuillères à soupe, tsp → cuillères à café, inches → cm
- Convertis les températures en °C (ex: "350°F" → "180°C")
- Convertis les prix en € si mentionnés
- Si un terme est déjà en français, garde-le tel quel

JSON à traduire :
${JSON.stringify(payload)}`,
        },
      ],
    });

    const raw = (message.content[0] as { text: string }).text;
    const translated = JSON.parse(extractJson(raw));

    return {
      title: translated.title ?? recipe.title,
      summary: translated.summary ?? recipe.summary,
      ingredients: recipe.ingredients.map((orig, i) => ({
        original: translated.ingredients?.[i]?.original ?? orig.original,
        name: translated.ingredients?.[i]?.name ?? orig.name,
      })),
      instructions: recipe.instructions.map((orig, i) => ({
        step: translated.instructions?.[i] ?? orig.step,
      })),
    };
  } catch (error) {
    console.error("Erreur traduction recette:", error);
    return recipe; // Non bloquant : on retourne l'original en anglais
  }
}

/**
 * Traduit une liste de titres de recettes en français.
 * Payload ultra léger (juste les titres) pour une réponse rapide.
 */
export async function translateRecipeTitles(
  recipes: Array<{ id: number; title: string }>,
): Promise<Map<number, string>> {
  const result = new Map<number, string>();

  if (recipes.length === 0) return result;

  try {
    // Payload minimaliste : juste id + title
    const payload = recipes.map((r) => [r.id, r.title]);

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Traduis ces titres de recettes en français. Réponds UNIQUEMENT avec un tableau JSON [[id,"titre traduit"],...], sans markdown.

${JSON.stringify(payload)}`,
        },
      ],
    });

    const raw = (message.content[0] as { text: string }).text;
    const translated: Array<[number, string]> = JSON.parse(extractJson(raw));

    for (const [id, title] of translated) {
      result.set(id, title);
    }
  } catch (error) {
    console.error("Erreur traduction titres:", error);
  }

  return result;
}

import { auth } from "@/lib/auth";
import { translateQueryToEnglish, translateRecipeTitles } from "@/lib/ai/translate-recipe";
import type { RecipeSummary } from "@/types/recipe";
import { NextRequest, NextResponse } from "next/server";

const SPOONACULAR_BASE = "https://api.spoonacular.com/recipes";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const offset = searchParams.get("offset") || "0";
  const number = searchParams.get("number") || "12";

  if (!query) {
    return NextResponse.json(
      { error: "Paramètre q requis" },
      { status: 400 },
    );
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API Spoonacular non configurée" },
      { status: 500 },
    );
  }

  try {
    // Traduire la requête FR → EN pour Spoonacular
    const englishQuery = await translateQueryToEnglish(query);

    const params = new URLSearchParams({
      apiKey,
      query: englishQuery,
      offset,
      number,
      addRecipeInformation: "true",
      fillIngredients: "false",
      instructionsRequired: "true",
    });

    const response = await fetch(`${SPOONACULAR_BASE}/complexSearch?${params}`);

    if (!response.ok) {
      const text = await response.text();
      console.error("Spoonacular search error:", response.status, text);
      return NextResponse.json(
        { error: "Erreur lors de la recherche de recettes" },
        { status: 502 },
      );
    }

    const data = await response.json();

    const results: RecipeSummary[] = (data.results ?? []).map(
      (r: Record<string, unknown>) => ({
        id: r.id as number,
        title: r.title as string,
        image: (r.image as string) ?? "",
        readyInMinutes: (r.readyInMinutes as number) ?? 0,
        servings: (r.servings as number) ?? 0,
        summary: stripHtml((r.summary as string) ?? ""),
      }),
    );

    // Traduire uniquement les titres en français (payload léger, réponse rapide)
    const titleMap = await translateRecipeTitles(results);
    const translatedResults = results.map((r) => {
      const title = titleMap.get(r.id);
      return title ? { ...r, title } : r;
    });

    return NextResponse.json({
      results: translatedResults,
      totalResults: data.totalResults ?? 0,
    });
  } catch (error) {
    console.error("Erreur recherche recettes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche de recettes" },
      { status: 500 },
    );
  }
}

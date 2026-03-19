import { auth } from "@/lib/auth";
import { translateRecipeTitles } from "@/lib/ai/translate-recipe";
import type { RecipeSummary } from "@/types/recipe";
import { NextResponse } from "next/server";

const SPOONACULAR_BASE = "https://api.spoonacular.com/recipes";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API Spoonacular non configurée" },
      { status: 500 },
    );
  }

  try {
    const params = new URLSearchParams({
      apiKey,
      number: "8",
      instructionsRequired: "true",
    });

    const response = await fetch(`${SPOONACULAR_BASE}/random?${params}`);

    if (!response.ok) {
      const text = await response.text();
      console.error("Spoonacular random error:", response.status, text);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des recettes" },
        { status: 502 },
      );
    }

    const data = await response.json();

    const results: RecipeSummary[] = (data.recipes ?? []).map(
      (r: Record<string, unknown>) => ({
        id: r.id as number,
        title: r.title as string,
        image: (r.image as string) ?? "",
        readyInMinutes: (r.readyInMinutes as number) ?? 0,
        servings: (r.servings as number) ?? 0,
        summary: stripHtml((r.summary as string) ?? ""),
      }),
    );

    // Traduire uniquement les titres (payload léger, réponse rapide)
    const titleMap = await translateRecipeTitles(results);
    const translatedResults = results.map((r) => {
      const title = titleMap.get(r.id);
      return title ? { ...r, title } : r;
    });

    return NextResponse.json({ results: translatedResults });
  } catch (error) {
    console.error("Erreur recettes populaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des recettes" },
      { status: 500 },
    );
  }
}

import { auth } from "@/lib/auth";
import { translateRecipeDetail } from "@/lib/ai/translate-recipe";
import type { RecipeDetail, RecipeIngredient, RecipeStep } from "@/types/recipe";
import { NextRequest, NextResponse } from "next/server";

const SPOONACULAR_BASE = "https://api.spoonacular.com/recipes";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const translate = request.nextUrl.searchParams.get("translate") === "true";

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API Spoonacular non configurée" },
      { status: 500 },
    );
  }

  try {
    const urlParams = new URLSearchParams({
      apiKey,
      includeNutrition: "false",
    });

    const response = await fetch(
      `${SPOONACULAR_BASE}/${id}/information?${urlParams}`,
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Spoonacular detail error:", response.status, text);
      return NextResponse.json(
        { error: "Recette introuvable" },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const r = await response.json();

    const ingredients: RecipeIngredient[] = (r.extendedIngredients ?? []).map(
      (ing: Record<string, unknown>) => ({
        id: ing.id,
        name: ing.name ?? "",
        original: ing.original ?? "",
        amount: ing.amount ?? 0,
        unit: ing.unit ?? "",
        image: ing.image
          ? `https://img.spoonacular.com/ingredients_100x100/${ing.image}`
          : "",
      }),
    );

    const instructions: RecipeStep[] =
      r.analyzedInstructions?.[0]?.steps?.map(
        (s: Record<string, unknown>) => ({
          number: s.number,
          step: s.step,
        }),
      ) ?? [];

    // Sans traduction : retour rapide
    if (!translate) {
      const recipe: RecipeDetail = {
        id: r.id,
        title: r.title ?? "",
        image: r.image ?? "",
        readyInMinutes: r.readyInMinutes ?? 0,
        servings: r.servings ?? 0,
        summary: stripHtml(r.summary ?? ""),
        ingredients,
        instructions,
        sourceUrl: r.sourceUrl ?? "",
        cuisines: r.cuisines ?? [],
        dishTypes: r.dishTypes ?? [],
      };
      return NextResponse.json(recipe);
    }

    // Avec traduction
    const translated = await translateRecipeDetail({
      title: r.title ?? "",
      summary: stripHtml(r.summary ?? ""),
      ingredients: ingredients.map((i) => ({
        original: i.original,
        name: i.name,
      })),
      instructions: instructions.map((s) => ({ step: s.step })),
    });

    const recipe: RecipeDetail = {
      id: r.id,
      title: translated.title,
      image: r.image ?? "",
      readyInMinutes: r.readyInMinutes ?? 0,
      servings: r.servings ?? 0,
      summary: translated.summary,
      ingredients: ingredients.map((ing, i) => ({
        ...ing,
        name: translated.ingredients[i]?.name ?? ing.name,
        original: translated.ingredients[i]?.original ?? ing.original,
      })),
      instructions: instructions.map((step, i) => ({
        ...step,
        step: translated.instructions[i]?.step ?? step.step,
      })),
      sourceUrl: r.sourceUrl ?? "",
      cuisines: r.cuisines ?? [],
      dishTypes: r.dishTypes ?? [],
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Erreur détail recette:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la recette" },
      { status: 500 },
    );
  }
}

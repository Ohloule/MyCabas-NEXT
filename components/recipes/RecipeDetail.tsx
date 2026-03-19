"use client";

import Loader from "@/components/Loader";
import type { RecipeDetail as RecipeDetailType, RecipeIngredient } from "@/types/recipe";
import { ArrowLeft, Clock, ExternalLink, Languages, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import IngredientChip from "./IngredientChip";
import IngredientSearchDialog from "./IngredientSearchDialog";

interface RecipeDetailProps {
  recipeId: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export default function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<RecipeIngredient | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set(),
  );
  const [customServings, setCustomServings] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        // 1. Charger la recette immédiatement (sans traduction)
        const response = await fetch(`/api/recipes/${recipeId}`);
        if (!response.ok) throw new Error("Recette introuvable");
        const data = await response.json();
        setRecipe(data);
        setLoading(false);

        // 2. Lancer la traduction en arrière-plan
        setTranslating(true);
        const trResponse = await fetch(`/api/recipes/${recipeId}?translate=true`);
        if (trResponse.ok) {
          const translated = await trResponse.json();
          setRecipe(translated);
        }
        setTranslating(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement",
        );
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  const handleIngredientSearch = (ingredient: RecipeIngredient) => {
    setSelectedIngredient(ingredient);
    setDialogOpen(true);
  };

  const handleIngredientToggle = (ingredient: RecipeIngredient) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient.id)) {
        next.delete(ingredient.id);
      } else {
        next.add(ingredient.id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader taille={45} />
        <p className="mt-4 text-neu-600">Chargement de la recette...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-sec-500">Oups !</p>
        <p className="text-neu-600 mt-2">{error ?? "Recette introuvable"}</p>
        <Link
          href="/livre-de-cuisine"
          className="mt-4 text-prin-600 hover:text-prin-700 font-medium text-sm flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux recettes
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Back link */}
      <Link
        href="/livre-de-cuisine"
        className="inline-flex items-center gap-1.5 text-sm text-neu-600 hover:text-prin-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux recettes
      </Link>

      {/* Indicateur de traduction */}
      {translating && (
        <div className="flex items-center gap-2 mb-4 text-xs text-neu-500 animate-pulse">
          <Languages className="w-3.5 h-3.5" />
          Traduction en cours...
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Image */}
        {recipe.image && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-neu-100">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Info */}
        <div>
          <h1 className="text-4xl sm:text-3xl font-special font-bold text-neu-900">
            {recipe.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-sm text-neu-600">
            {recipe.readyInMinutes > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-prin-600" />
                {formatDuration(recipe.readyInMinutes)}
              </span>
            )}
            {recipe.servings > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-prin-600" />
                {recipe.servings} portions
              </span>
            )}
          </div>

          {/* Cuisines / Dish types */}
          {(recipe.cuisines.length > 0 || recipe.dishTypes.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.cuisines.map((c) => (
                <span
                  key={c}
                  className="text-xs bg-prin-50 text-prin-700 rounded-full px-2.5 py-0.5"
                >
                  {c}
                </span>
              ))}
              {recipe.dishTypes.map((d) => (
                <span
                  key={d}
                  className="text-xs bg-neu-100 text-neu-600 rounded-full px-2.5 py-0.5"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Summary */}
          {recipe.summary && (
            <p className="text-sm text-neu-600 mt-4 leading-relaxed text-justify">
              {recipe.summary}
            </p>
          )}

          {/* Source */}
          {recipe.sourceUrl && (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-neu-400 hover:text-prin-600 mt-3 transition-colors"
            >
              Source originale
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Ingrédients + Préparation : côte à côte sur desktop, empilé sur mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Instructions */}
        {recipe.instructions.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-neu-900 mb-4 font-special">Préparation</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step) => (
                <li key={step.number} className="flex gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-prin-100 text-prin-700 text-sm font-bold shrink-0 mt-0.5">
                    {step.number}
                  </span>
                  <p className="text-sm text-neu-700 leading-relaxed pt-1 text-justify">
                    {step.step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Ingredients */}
        <section>
          <div className="flex items-center justify-between mb-4 gap-4">
            <h2 className="text-3xl font-bold text-neu-900 font-special">
              Ingrédients
            </h2>

            {/* Sélecteur de portions */}
            {recipe.servings > 0 && (
              <div className="flex items-center gap-0 shrink-0 rounded-full border border-neu-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    setCustomServings((prev) =>
                      Math.max(1, (prev ?? recipe.servings) - 1),
                    )
                  }
                  className="flex items-center justify-center w-8 h-8 bg-prin-600 hover:bg-prin-500 text-white transition-colors cursor-pointer text-sm font-bold"
                >
                  -
                </button>
                <span className="text-sm font-medium text-neu-800 px-3 whitespace-nowrap">
                  {customServings ?? recipe.servings} personnes
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCustomServings((prev) =>
                      (prev ?? recipe.servings) + 1,
                    )
                  }
                  className="flex items-center justify-center w-8 h-8 bg-prin-600 hover:bg-prin-500 text-white transition-colors cursor-pointer text-sm font-bold"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {recipe.ingredients.map((ingredient, index) => (
              <IngredientChip
                key={`${ingredient.id}-${index}`}
                ingredient={ingredient}
                checked={checkedIngredients.has(ingredient.id)}
                ratio={
                  recipe.servings > 0
                    ? (customServings ?? recipe.servings) / recipe.servings
                    : 1
                }
                onToggle={handleIngredientToggle}
                onSearch={handleIngredientSearch}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Ingredient Search Dialog */}
      {selectedIngredient && (
        <IngredientSearchDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          ingredientName={selectedIngredient.name}
          ingredientOriginal={selectedIngredient.original}
        />
      )}
    </>
  );
}

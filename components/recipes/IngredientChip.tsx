"use client";

import { Check, ShoppingCart } from "lucide-react";
import type { RecipeIngredient } from "@/types/recipe";

interface IngredientChipProps {
  ingredient: RecipeIngredient;
  checked: boolean;
  ratio: number;
  onToggle: (ingredient: RecipeIngredient) => void;
  onSearch: (ingredient: RecipeIngredient) => void;
}

/** Remplace le premier nombre trouvé dans le texte par la quantité ajustée selon le ratio */
function adjustOriginalText(original: string, ratio: number): string {
  if (ratio === 1) return original;
  // Extrait le premier nombre du texte traduit et le multiplie par le ratio
  return original.replace(/[\d]+([.,]\d+)?/, (match) => {
    const num = parseFloat(match.replace(",", "."));
    if (isNaN(num)) return match;
    return String(Math.round(num * ratio));
  });
}

export default function IngredientChip({
  ingredient,
  checked,
  ratio,
  onToggle,
  onSearch,
}: IngredientChipProps) {
  const displayText = adjustOriginalText(ingredient.original, ratio);

  return (
    <div
      className={`flex items-center gap-3 w-full py-2.5 px-2 border-b border-neu-100 last:border-b-0 rounded-sm transition-colors ${checked ? "bg-prin-50/60" : ""}`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(ingredient)}
        className={`flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-colors cursor-pointer ${
          checked
            ? "bg-prin-600 border-prin-600 text-white"
            : "border-neu-300 hover:border-prin-400"
        }`}
      >
        {checked && <Check className="w-3 h-3" />}
      </button>

      {/* Ingredient text */}
      <span
        className={`text-sm flex-1 transition-colors ${
          checked ? "text-neu-400 line-through" : "text-neu-800"
        }`}
      >
        {displayText}
      </span>

      {/* Search button */}
      <button
        type="button"
        onClick={() => onSearch(ingredient)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-prin-100 hover:bg-prin-200 text-prin-600 shrink-0 transition-colors cursor-pointer"
        title="Trouver sur mes marchés"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

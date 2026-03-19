"use client";

import type { Nutrient, RecipeNutrition } from "@/types/recipe";
import { useState } from "react";

interface NutritionTabsProps {
  nutrition: RecipeNutrition;
}

const MACRO_NAMES = ["Calories", "Protein", "Carbohydrates", "Fat"];
const MACRO_DETAIL_NAMES = [
  "Saturated Fat",
  "Cholesterol",
  "Sodium",
  "Fiber",
  "Sugar",
  "Net Carbohydrates",
];
const VITAMIN_NAMES = [
  "Vitamin A",
  "Vitamin B1",
  "Vitamin B2",
  "Vitamin B3",
  "Vitamin B5",
  "Vitamin B6",
  "Vitamin B12",
  "Folate",
  "Vitamin C",
  "Vitamin D",
  "Vitamin E",
  "Vitamin K",
  "Iron",
  "Calcium",
  "Magnesium",
  "Zinc",
  "Potassium",
  "Phosphorus",
];

const LABELS: Record<string, string> = {
  Calories: "Calories",
  Protein: "Protéines",
  Carbohydrates: "Glucides",
  Fat: "Lipides",
  "Saturated Fat": "Graisses saturées",
  Cholesterol: "Cholestérol",
  Sodium: "Sodium",
  Fiber: "Fibres",
  Sugar: "Sucres",
  "Net Carbohydrates": "Glucides nets",
  "Vitamin A": "Vitamine A",
  "Vitamin B1": "Vitamine B1",
  "Vitamin B2": "Vitamine B2",
  "Vitamin B3": "Vitamine B3",
  "Vitamin B5": "Vitamine B5",
  "Vitamin B6": "Vitamine B6",
  "Vitamin B12": "Vitamine B12",
  Folate: "Folate",
  "Vitamin C": "Vitamine C",
  "Vitamin D": "Vitamine D",
  "Vitamin E": "Vitamine E",
  "Vitamin K": "Vitamine K",
  Iron: "Fer",
  Calcium: "Calcium",
  Magnesium: "Magnésium",
  Zinc: "Zinc",
  Potassium: "Potassium",
  Phosphorus: "Phosphore",
};

const TABS = [
  { id: "macros", label: "Macros" },
  { id: "details", label: "Détails" },
  { id: "vitamins", label: "Vitamines & Minéraux" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function filterNutrients(nutrients: Nutrient[], names: string[]): Nutrient[] {
  return names
    .map((name) => nutrients.find((n) => n.name === name))
    .filter((n): n is Nutrient => n !== undefined);
}

function NutrientRow({ nutrient }: { nutrient: Nutrient }) {
  const label = LABELS[nutrient.name] ?? nutrient.name;
  const isCalories = nutrient.name === "Calories";
  const percent = Math.min(nutrient.percentOfDailyNeeds, 100);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-neu-100 last:border-b-0">
      <span className="text-sm text-neu-700 w-36 shrink-0 font-medium">
        {label}
      </span>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2 bg-neu-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor:
                percent > 75
                  ? "var(--color-sec-500)"
                  : percent > 40
                    ? "var(--color-prin-500)"
                    : "var(--color-prin-300)",
            }}
          />
        </div>
        <span className="text-sm text-neu-800 font-semibold w-20 text-right tabular-nums">
          {isCalories
            ? `${Math.round(nutrient.amount)} ${nutrient.unit}`
            : `${Number(nutrient.amount.toFixed(1))} ${nutrient.unit}`}
        </span>
        <span className="text-xs text-neu-400 w-12 text-right tabular-nums">
          {Math.round(nutrient.percentOfDailyNeeds)}%
        </span>
      </div>
    </div>
  );
}

export default function NutritionTabs({ nutrition }: NutritionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("macros");

  const macros = filterNutrients(nutrition.nutrients, MACRO_NAMES);
  const details = filterNutrients(nutrition.nutrients, MACRO_DETAIL_NAMES);
  const vitamins = filterNutrients(nutrition.nutrients, VITAMIN_NAMES);

  const currentNutrients =
    activeTab === "macros"
      ? macros
      : activeTab === "details"
        ? details
        : vitamins;

  if (macros.length === 0) return null;

  return (
    <section className="mt-8 max-w-md">
      <h2 className="text-3xl font-bold text-neu-900 mb-4 font-special">
        Valeurs nutritionnelles
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-neu-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-prin-700 shadow-sm"
                : "text-neu-500 hover:text-neu-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-neu-200 p-4">
        <p className="text-xs text-neu-400 mb-3">
          % des apports journaliers recommandés
        </p>
        {currentNutrients.length > 0 ? (
          currentNutrients.map((nutrient) => (
            <NutrientRow key={nutrient.name} nutrient={nutrient} />
          ))
        ) : (
          <p className="text-sm text-neu-400 py-4 text-center">
            Données non disponibles
          </p>
        )}
      </div>
    </section>
  );
}

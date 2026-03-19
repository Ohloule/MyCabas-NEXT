export interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  original: string;
  amount: number;
  unit: string;
  image: string;
}

export interface RecipeStep {
  number: number;
  step: string;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export interface RecipeNutrition {
  nutrients: Nutrient[];
}

export interface RecipeDetail extends RecipeSummary {
  ingredients: RecipeIngredient[];
  instructions: RecipeStep[];
  sourceUrl: string;
  cuisines: string[];
  dishTypes: string[];
  nutrition?: RecipeNutrition;
}

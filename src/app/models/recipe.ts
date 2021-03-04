import { Ingredient } from "./ingredient";
import { Source } from "./source";

export interface Recipe {
  id: number;
  name?: string;
  source?: Source;
  ingredients?: Ingredient[];
  notes?: string;
}

export type MinimalRecipe = Pick<Recipe, "id" | "name">;

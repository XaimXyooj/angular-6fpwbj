import { Source } from "./source";

export interface Recipe {
  id: number,
  name?: string,
  source?: Source,
  notes?: string
}

export type MinimalRecipe = Pick<Recipe, "id" | "name">

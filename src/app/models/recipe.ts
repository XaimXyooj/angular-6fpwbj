export interface Recipe {
  id: number,
  name?: string,
  notes?: string
}

export type MinimalRecipe = Pick<Recipe, "id" | "name">

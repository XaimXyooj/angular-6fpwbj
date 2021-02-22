import { Injectable } from "@angular/core";
import { InMemoryDbService } from "angular-in-memory-web-api";
import { MinimalRecipe, Recipe } from "./models/recipe";

@Injectable()
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const recipes = [
      { id: 11, name: "Dr Nice", notes: "Hello" },
      { id: 12, name: "Narco", notes: "World" },
      { id: 13, name: "Bombasto", notes: "Foo" },
      { id: 14, name: "Celeritas", notes: "Bar" },
      { id: 15, name: "Magneta", notes: "Bye" },
      { id: 16, name: "RubberMan", notes: "Buddy" },
      { id: 17, name: "Dynama", notes: "Good" },
      { id: 18, name: "Dr IQ", notes: "Night" },
      { id: 19, name: "Magma", notes: "Seeya" },
      { id: 20, name: "Tornado", notes: "Tomorrow" },
      { id: 21, name: "Sai", notes: "Xiong" }
    ];

    return {
      recipes: {
        values: recipes.map(
          ({ id, name }: Recipe): MinimalRecipe => ({
            id,
            name
          })
        )
      },
      recipe: recipes
    };
  }

  genId(recipes: Recipe[]): number {
    return recipes.length > 0
      ? Math.max(...recipes.map(recipe => recipe.id)) + 1
      : 11;
  }
}

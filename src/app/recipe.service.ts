import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { List } from "./models/list";
import { MinimalRecipe, Recipe } from "./models/recipe";

@Injectable()
export class RecipeService {
  constructor(private httpClient: HttpClient) {}

  public list(): Observable<List<MinimalRecipe>> {
    return this.httpClient.get<List<MinimalRecipe>>("api/recipes", {
      responseType: "json",
      observe: "body"
    });
  }

  public get(id: number): Observable<Recipe> {
    return this.httpClient.get<Recipe>(`api/recipe/${id}`, {
      responseType: "json",
      observe: "body"
    });
  }
}

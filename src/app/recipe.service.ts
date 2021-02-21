import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { List } from "./models/list";
import { MinimalRecipe } from "./models/recipe";

@Injectable()
export class RecipeService {
  construct() {}

  public list(): Observable<List<MinimalRecipe>> {
    return of({
      values: [
        {
          id: 1,
          name: "foo",
          extra: "extra"
        },
        {
          id: 2,
          name: "bar",
          extra: "data"
        }
      ]
    });
  }
}

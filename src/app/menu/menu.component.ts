import { Component, Input, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { GridRow } from "../models/grid-row";
import { List } from "../models/list";
import { MinimalRecipe } from "../models/recipe";
import { RecipeService } from "../recipe.service";

@Component({
  selector: "menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"]
})
export class MenuComponent implements OnInit {
  @Input() public data: Observable<GridRow<number>[]>;

  constructor(private recipeService: RecipeService) {}

  public ngOnInit(): void {
    this.data = this.recipeService.list().pipe(
      map(
        (recipes: List<MinimalRecipe>): GridRow<number>[] =>
          recipes.values.map(
            (recipe: MinimalRecipe): GridRow<number> => ({
              "#": recipes.values.indexOf(recipe) + 1,
              ...recipe
            })
          )
      )
    );
  }
}

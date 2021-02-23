import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
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
    this.data = this.recipeService
      .list()
      .pipe(map((list: List<MinimalRecipe>): MinimalRecipe[] => list.values));
  }

  public onSelect(id: number): void {
    // TODO - bubble up the selection
    console.log(id);
  }
}

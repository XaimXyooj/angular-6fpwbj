import { Component, Input, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { List } from "../models/list";
import { MinimalRecipe } from "../models/recipe";
import { RecipeService } from "../recipe.service";

@Component({
  selector: "menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.css"]
})
export class MenuComponent implements OnInit {
  @Input() public data: Observable<MinimalRecipe[]>;

  constructor(private recipeService: RecipeService) {}

  public ngOnInit(): void {
    this.data = this.recipeService
      .list()
      .pipe(map((list: List<MinimalRecipe>): MinimalRecipe[] => list.values));
  }
}

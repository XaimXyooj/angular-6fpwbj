import { Component, Input } from "@angular/core";
import { Observable } from "rxjs";
import { Recipe } from "../models/recipe";
import { RecipeService } from "../recipe.service";

@Component({
  selector: "detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.css"]
})
export class DetailComponent {
  public recipe: Observable<Recipe>;

  @Input() public id: number;

  constructor(private recipeService: RecipeService) { }

  public ngOnInit(): void {
    this.recipe = this.recipeService.get(this.id);
  }
}

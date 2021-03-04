import { Component, Input } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { GridRow } from "../models/grid-row";
import { Ingredient } from "../models/ingredient";
import { Recipe } from "../models/recipe";
import { RecipeService } from "../recipe.service";

interface IngredientRow extends GridRow<number> {
  text: string;
}

@Component({
  selector: "detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.css"]
})
export class DetailComponent {
  private recipe: Subject<Recipe>;

  public ingredients: Observable<IngredientRow[]>;
  public name: string;
  public sourceText: string;
  public sourceUrl: string;

  @Input() public id: number;

  constructor(private recipeService: RecipeService) {
    this.recipe = new Subject<Recipe>();
  }

  public ngOnInit(): void {
    this.ingredients = this.recipe.pipe(
      map(
        ({ ingredients }: Recipe): IngredientRow[] => !ingredients ? [] : ingredients.map((
          ingredient: Ingredient,
          index: number
          ): IngredientRow =>
            ({
              id: index,
              text: this.formatIngredient(ingredient)
            }))
      )
    );
    this.recipeService.get(this.id).subscribe((recipe: Recipe): void => {
      this.name = recipe.name;
      this.sourceText = recipe.source?.display;
      this.sourceUrl = recipe.source?.url;

      this.recipe.next(recipe);
    }, console.error);
  }

  private formatIngredient(ingredient: Ingredient): string {
    const quantity: number = ingredient.amount.quantity;
    const unit: string = ingredient.amount.unit;
    const name: string = ingredient.name;
    const prep: string = ingredient.prep;

    return `${quantity}${`${unit ? ` ${unit} of ` : " "}`}${name}${`${
      prep ? ` ${prep}` : ""
    }`}`;
  }
}

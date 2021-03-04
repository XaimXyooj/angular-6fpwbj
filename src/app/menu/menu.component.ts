import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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

  @Output() public selections: EventEmitter<number[]>;

  constructor(private recipeService: RecipeService) {
    this.selections = new EventEmitter<number[]>();
  }

  public ngOnInit(): void {
    this.data = this.recipeService
      .list()
      .pipe(map((list: List<MinimalRecipe>): MinimalRecipe[] => list.values));
  }

  public onSelect(selectedIds: number | number[]): void {
    if (Array.isArray(selectedIds)) {
      this.selections.emit(selectedIds);
    } else {
      this.selections.emit([selectedIds]);
    }
  }
}

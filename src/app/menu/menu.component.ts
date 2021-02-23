import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import { ColDef, GridOptions } from "ag-grid-community";
import { Observable } from "rxjs";
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
  public colDefs: ColDef[];
  @Input() public data: Observable<MinimalRecipe[]>;

  @ViewChild("agGrid") agGrid: AgGridAngular;

  constructor(private recipeService: RecipeService) {
    const nameCol: ColDef = {
      headerName: "Name",
      field: "name"
    };
    this.colDefs = [nameCol];
  }

  public ngOnInit(): void {
    this.data = this.recipeService
      .list()
      .pipe(map((list: List<MinimalRecipe>): MinimalRecipe[] => list.values));
  }

  public onGridReady(options: GridOptions): void {
    options.api.sizeColumnsToFit();
  }
}

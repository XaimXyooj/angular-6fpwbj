import { Component } from "@angular/core";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public index: number;
  public selectedIds: number[];

  constructor() {
    this.index = 0;
    this.selectedIds = [];
  }

  public hideRecipe(id: number): boolean {
    return this.selectedIds.indexOf(id) !== this.index;
  }

  public next(): void {
    ++this.index;
  }

  public onSelect(ids: number[]): void {
    // TODO retain selection order
    this.selectedIds = ids;
  }

  public prev(): void {
    this.index--;
  }
}

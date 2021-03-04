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
    this.selectedIds = Array.from(
      new Set([
        ...this.selectedIds.filter((id: number): boolean => ids.includes(id)),
        ...ids
      ])
    );

    this.index = Math.min(this.index, this.selectedIds.length - 1);
  }

  public prev(): void {
    this.index--;
  }
}

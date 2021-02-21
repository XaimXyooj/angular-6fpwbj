import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridRow } from "../models/grid-row";

@Component({
  selector: "grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.css"]
})
export class GridComponent<T> implements OnInit {
  public columns: Observable<string[]>;
  @Input() public data: Observable<GridRow<T>[]>;
  @Input() public showHeader: boolean = false;
  @Input() public showNumber: boolean = false;

  constructor() {}

  public ngOnInit(): void {
    this.columns = this.data.pipe(
      map(
        (rows: GridRow<T>[]): string[] => {
          const keys: string[] = [];

          if (this.showNumber) {
            keys.push("#");
          }

          rows.forEach(
            (row: GridRow<T>): void =>
              Object.keys(row).forEach(
                (key: string): void => {
                  if (keys.includes(key)) {
                    return;
                  }

                  keys.push(key);
                }
              )
          );

          return keys;
        }
      )
    );
  }
}

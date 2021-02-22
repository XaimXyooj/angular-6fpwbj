import { Component, Input, OnInit } from "@angular/core";
import { combineLatest, Observable, Subject } from "rxjs";
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  tap
} from "rxjs/operators";
import { GridRow } from "../models/grid-row";
import { PageUpdate } from "../models/page-update";

@Component({
  selector: "grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.css"]
})
export class GridComponent<T> implements OnInit {
  public columns: Observable<string[]>;
  public p: number;
  public s: number;
  public pageUpdate: Subject<PageUpdate>;
  public rows: Observable<GridRow<T>[]>;

  @Input() public data: Observable<GridRow<T>[]>;
  @Input() public page: number = 1;
  @Input() public pageSize: number = 5;
  @Input() public showHeader: boolean = false;
  @Input() public showNumber: boolean = false;
  @Input() public showPager: boolean = false;

  constructor() {
    this.p = this.page;
    this.s = this.pageSize;
    this.pageUpdate = new Subject<PageUpdate>();
  }

  public ngOnInit(): void {
    const sharedData: Observable<GridRow<T>[]> = this.data.pipe(
      distinctUntilChanged(),
      shareReplay(1)
    );

    this.columns = sharedData.pipe(
      map(
        (rows: GridRow<T>[]): string[] =>
          this.buildColumnKeys(rows, this.showNumber)
      )
    );
    this.rows = combineLatest([
      sharedData.pipe(
        map((rows: GridRow<T>[]): GridRow<T>[] => this.populateIndex(rows))
      ),
      this.pageUpdate.pipe(
        tap(
          ({ page, size }: PageUpdate): void => {
            this.p = page;
            this.s = size;
          }
        ),
        map(({ bounds }: PageUpdate): [number, number] => bounds),
        distinctUntilChanged(),
        startWith([(this.p - 1) * this.s, this.p * this.s])
      )
    ]).pipe(
      map(
        ([rows, [start, end]]: [GridRow<T>[], [number, number]]): GridRow<
          T
        >[] => rows.slice(start, end)
      )
    );
  }

  public pageUpdated(update: PageUpdate): void {
    this.pageUpdate.next(update);
  }

  private buildColumnKeys(rows: any[], prependIndex: boolean): string[] {
    const keys: string[] = rows
      .map((row: any): string[] => Object.keys(row))
      .reduce(
        (result: string[], current: string[]): string[] =>
          result.concat(current),
        []
      )
      .filter((key: string): boolean => key !== "id")
      .filter(
        (key: string, index: number, array: string[]): boolean =>
          array.indexOf(key) === index
      );

    if (this.showNumber) {
      keys.unshift("#");
    }

    return keys;
  }

  private populateIndex(rows: GridRow<T>[]): GridRow<T>[] {
    return rows.map(
      (row: GridRow<T>): GridRow<T> => ({
        ...row,
        "#": rows.indexOf(row) + 1
      })
    );
  }
}

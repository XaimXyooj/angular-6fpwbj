import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
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

export enum SelectMode {
  NONE,
  SINGLE,
  MULTI
}

@Component({
  selector: "grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.css"]
})
export class GridComponent<T> implements OnDestroy, OnInit {
  public readonly SELECT_MODE = SelectMode;

  private pageUpdate: Subject<PageUpdate>;
  private teardown: Subject<any>;

  public columns: Observable<string[]>;
  public currentPage: number;
  public itemsPerPage: number;
  public rows: Observable<GridRow<T>[]>;
  public rowSelectForm: FormGroup;

  @Input() public data: Observable<GridRow<T>[]>;
  @Input() public page: number = 1;
  @Input() public pageSize: number = 5;
  @Input() public select: SelectMode = SelectMode.MULTI;
  @Input() public showHeader: boolean = false;
  @Input() public showNumber: boolean = false;
  @Input() public showPager: boolean = false;

  @Output() public selections: EventEmitter<T | T[]>;

  constructor() {
    this.currentPage = this.page;
    this.itemsPerPage = this.pageSize;
    this.pageUpdate = new Subject<PageUpdate>();
    this.rowSelectForm = new FormGroup({
      headerSelect: new FormControl(false)
    });
    this.teardown = new Subject<any>();
  }

  public ngOnDestroy(): void {
    this.pageUpdate.complete();
    this.selections.complete();
    this.teardown.next();
    this.teardown.complete();
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
        tap(
          (rows: GridRow<T>[]): void => {
            const rowKeys: string[] = rows.map(
              (row: GridRow<T>): string => `${row.id}`
            );

            Object.keys(this.rowSelectForm.controls)
              .filter(
                (controlName: string): boolean => controlName !== "headerSelect"
              )
              .filter(
                (controlName: string): boolean => !rowKeys.includes(controlName)
              )
              .forEach(
                (controlName: string): void =>
                  this.rowSelectForm.removeControl(controlName)
              );

            rowKeys.forEach(
              (rowKey: string): void => {
                const control: AbstractControl = this.rowSelectForm.controls[
                  rowKey
                ];

                if (!control) {
                  this.rowSelectForm.addControl(rowKey, new FormControl(false));
                }
              }
            );
          }
        ),
        map((rows: GridRow<T>[]): GridRow<T>[] => this.populateIndex(rows))
      ),
      this.pageUpdate.pipe(
        tap(
          ({ page, size }: PageUpdate): void => {
            this.currentPage = page;
            this.itemsPerPage = size;
          }
        ),
        map(({ bounds }: PageUpdate): [number, number] => bounds),
        distinctUntilChanged(),
        startWith([
          (this.currentPage - 1) * this.itemsPerPage,
          this.currentPage * this.itemsPerPage
        ])
      )
    ]).pipe(
      map(
        ([rows, [start, end]]: [GridRow<T>[], [number, number]]): GridRow<
          T
        >[] => rows.slice(start, end)
      )
    );
    this.selections = undefined;
    this.rowSelectForm.valueChanges
      .pipe
      // TODO apply headerSelect and then exclude it from selected
      ();
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

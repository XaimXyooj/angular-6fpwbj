import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { combineLatest, merge, Observable, Subject } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  skip,
  startWith,
  takeUntil,
  tap,
  withLatestFrom
} from "rxjs/operators";
import { GridRow } from "../models/grid-row";
import { PageUpdate } from "../models/page-update";

export type SelectMode = "SINGLE" | "MULTI" | "NONE";

@Component({
  selector: "grid",
  templateUrl: "./grid.component.html",
  styleUrls: ["./grid.component.css"]
})
export class GridComponent<T> implements OnDestroy, OnInit {
  public checkboxesReady: boolean;
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
  @Input() public selectMode: SelectMode = "MULTI";
  @Input() public showHeader: boolean = false;
  @Input() public showNumber: boolean = false;
  @Input() public showPager: boolean = false;

  @Output() public selections: EventEmitter<T | T[]>;

  public get checkboxes(): FormArray {
    return this.rowSelectForm.controls.checkboxes as FormArray;
  }

  constructor() {
    this.checkboxesReady = false;
    this.currentPage = this.page;
    this.itemsPerPage = this.pageSize;
    this.pageUpdate = new Subject<PageUpdate>();
    this.rowSelectForm = new FormGroup({
      checkboxes: new FormArray([])
    });
    this.selections = new EventEmitter<T | T[]>();
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
      takeUntil(this.teardown),
      distinctUntilChanged(),
      shareReplay(1)
    );
    const sharedCheckboxValues: Observable<
      T[] | boolean[]
    > = this.checkboxes.valueChanges.pipe(
      takeUntil(this.teardown),
      filter((): boolean => this.checkboxesReady),
      shareReplay(1)
    );
    const selectedIds: Observable<T[]> = merge(
      sharedCheckboxValues.pipe(
        filter((): boolean => this.selectMode === "SINGLE")
      ),
      sharedCheckboxValues.pipe(
        filter((): boolean => this.selectMode === "MULTI"),
        withLatestFrom(
          sharedData.pipe(
            map(
              (rows: GridRow<T>[]): T[] =>
                rows.map(({ id }: GridRow<T>): T => id)
            )
          )
        ),
        map(
          ([allCheckboxes, ids]: [boolean[], T[]]): T[] =>
            allCheckboxes
              .map(
                (checked: boolean, index: number): T =>
                  checked ? ids[index] : undefined
              )
              .filter((id: T): boolean => !!id)
        )
      )
    ).pipe(
      startWith([]),
      distinctUntilChanged(
        (prev: T[], curr: T[]): boolean =>
          !prev.some((id: T): boolean => !curr.includes(id)) &&
          !curr.some((id: T): boolean => !prev.includes(id))
      ),
      shareReplay(1)
    );

    selectedIds
      .pipe(
        skip(1),
        map(
          (ids: T[]): T | T[] => {
            if (this.selectMode === "SINGLE") {
              return ids[0];
            }

            return ids;
          }
        )
      )
      .subscribe((selections: T | T[]): void => {
        this.selections.emit(selections);
      }, console.error);

    sharedData.pipe(withLatestFrom(selectedIds)).subscribe(
      ([rows, preSelectedIds]: [GridRow<T>[], T[]]): void => {
        this.checkboxesReady = false;

        this.checkboxes.clear();

        if (this.selectMode === "SINGLE") {
          this.checkboxes.push(new FormControl(preSelectedIds[0]));
        } else {
          rows
            .map(({ id }: GridRow<T>): T => id)
            .forEach(
              (id: T): void =>
                this.checkboxes.push(
                  new FormControl(preSelectedIds.includes(id))
                )
            );
        }

        this.checkboxesReady = true;

        // TODO do we need to emit the new selections when to data changes?
      }
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
  }

  public allSelected(): boolean {
    return !this.checkboxes.getRawValue().includes(false);
  }

  public pageUpdated(update: PageUpdate): void {
    this.pageUpdate.next(update);
  }

  public selectAll(e: Event): void {
    const target: HTMLInputElement = e.target as HTMLInputElement;
    const values: boolean[] = this.checkboxes.value;

    values.fill(target.checked);

    this.checkboxes.setValue(values);

    // for some reason the ui won't update, even though it's bound to allSelected already
    target.checked = this.allSelected();
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

    if (prependIndex) {
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

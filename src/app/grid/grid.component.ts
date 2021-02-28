import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { combineLatest, Observable, Subject } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  pairwise,
  shareReplay,
  startWith,
  takeUntil,
  tap,
  withLatestFrom
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

  private checkboxesReady: boolean;
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

  public get checkboxes(): FormArray {
    return this.rowSelectForm.controls.checkboxes as FormArray;
  }

  constructor() {
    this.checkboxesReady = false;
    this.currentPage = this.page;
    this.itemsPerPage = this.pageSize;
    this.pageUpdate = new Subject<PageUpdate>();
    this.rowSelectForm = new FormGroup({
      checkboxes: new FormArray([new FormControl(false)])
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
    const selectedIds = this.checkboxes.valueChanges.pipe(
      takeUntil(this.teardown),
      filter((): boolean => this.checkboxesReady),
      withLatestFrom(
        sharedData.pipe(
          map(
            (rows: GridRow<T>[]): T[] => rows.map(({ id }: GridRow<T>): T => id)
          )
        )
      ),
      map(
        ([allCheckboxes, ids]: [boolean[], T[]]): T[] =>
          allCheckboxes
            .map(
              (checked: boolean, index: number): T =>
                checked ? ids[index - 1] : undefined
            )
            .filter((id: T): boolean => !!id)
      ),
      startWith([]),
      distinctUntilChanged(),
      shareReplay(1)
    );

    selectedIds
      .pipe(
        pairwise(),
        map(
          ([prev, current]: [T[], T[]]): T | T[] => {
            if (this.select === SelectMode.SINGLE) {
              if (!current.length) {
                return undefined;
              }

              if (current.length === 1) {
                return current[0];
              }

              // TODO de-select previous selection

              return current.filter((c: T): boolean => !prev.includes(c))[0];
            }

            return current;
          }
        ),
        distinctUntilChanged()
      )
      .subscribe((selections: T | T[]): void => {
        this.selections.emit(selections);
      }, console.error);

    sharedData.pipe(withLatestFrom(selectedIds.pipe(startWith([])))).subscribe(
      ([rows, ids]: [GridRow<T>[], T[]]): void => {
        this.checkboxesReady = false;

        while (this.checkboxes.controls.length > 1) {
          this.checkboxes.removeAt(1);
        }

        rows
          .map(({ id }: GridRow<T>): T => id)
          .forEach(
            (id: T): void =>
              this.checkboxes.push(new FormControl(ids.includes(id)))
          );

        this.checkboxesReady = true;
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

import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup
} from "@angular/forms";
import { BehaviorSubject, combineLatest, Observable, Subject } from "rxjs";
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  takeUntil,
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

  private checkboxesReady: boolean;
  private pageUpdate: Subject<PageUpdate>;
  private selectedIds: BehaviorSubject<T[]>;
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
    this.selectedIds = new BehaviorSubject<T[]>([]);
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
      distinctUntilChanged(),
      tap(
        (rows: GridRow<T>[]): void => {
          this.checkboxesReady = false;

          while (this.checkboxes.controls.length > 1) {
            this.checkboxes.removeAt(1);
          }

          rows
            .map(({ id }: GridRow<T>): T => id)
            .forEach(
              (id: T): void =>
                this.checkboxes.push(
                  new FormControl(this.selectedIds.value.includes(id))
                )
            );

          this.checkboxesReady = true;
        }
      ),
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
    // TODO emit selections based on selectedIds and selectMode
    this.checkboxes.valueChanges
      .pipe(
        takeUntil(this.teardown),
        filter((): boolean => this.checkboxesReady)
        // TODO map the selecteds to the row id, based on index
        // map(({ checkboxes }: { checkboxes: boolean[] }): T[] => [])
      )
      .subscribe(console.log, console.error);
  }

  public pageUpdated(update: PageUpdate): void {
    this.pageUpdate.next(update);
  }

  public selectorType(): "checkbox" | "radio" {
    switch (this.select) {
      case SelectMode.SINGLE:
        return "radio";
      default:
        return "checkbox";
    }
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

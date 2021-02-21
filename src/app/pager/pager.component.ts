import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { PageUpdate } from "../models/page-update";

@Component({
  selector: "pager",
  templateUrl: "./pager.component.html",
  styleUrls: ["./pager.component.css"]
})
export class PagerComponent implements OnDestroy, OnInit {
  @Input() public itemCount: number = 0;
  @Input() public page: number = 1;
  @Input() public size: number = 5;

  @Output() public update: EventEmitter<PageUpdate> = new EventEmitter<
    PageUpdate
  >();

  constructor() {}

  public ngOnDestroy(): void {
    this.update.complete();
  }

  public ngOnInit(): void {
    // TODO Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'rows: null'. Current value: 'rows: [object Object]'
    this.pageTo(this.page);
  }

  public hasNext(): boolean {
    return this.page < this.pageCount();
  }

  public hasPrev(): boolean {
    return this.page > 1;
  }

  public isCurrentPage(p: number): boolean {
    return this.page === p;
  }

  public pageCount(): number {
    return Math.ceil(this.itemCount / this.size);
  }

  public pageList(): number[] {
    const pages: number[] = [];

    for (let i = 1, j = this.pageCount(); i <= j; i++) {
      pages.push(i);
    }

    return pages;
  }

  public pageNext(): void {
    this.pageTo(this.page + 1);
  }

  public pagePrev(): void {
    this.pageTo(this.page - 1);
  }

  public pageTo(p: number): void {
    this.update.next({
      page: p,
      size: this.size,
      bounds: [
        Math.max(1, (p - 1) * this.size),
        Math.min(this.itemCount, p * this.size)
      ]
    });
  }
}

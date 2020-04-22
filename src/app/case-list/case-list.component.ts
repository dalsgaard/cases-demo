import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import {
  fromEvent,
  merge,
  of,
  combineLatest,
  Observable,
  Subject,
  OperatorFunction,
  Subscription,
} from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
  first,
} from 'rxjs/operators';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FetchInput, Sort, CaseListDataSource } from './case-list.datasource';
import { Case } from './case-list.models';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CaseListService } from './case-list.service';
import { SortStore } from '../utils';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';

type Page = {
  pageIndex: number;
  pageSize: number;
};

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.css'],
})
export class CaseListComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('search') search: ElementRef<HTMLInputElement>;
  @ViewChild('caseType', { read: MatButtonToggleGroup })
  caseType: MatButtonToggleGroup;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  defaultCaseType = 'active';
  displayedColumns: string[] = ['select', 'id', 'brand', 'model'];
  dataSource: CaseListDataSource;
  sortStore = new SortStore('case-list');
  searchParam$!: Observable<string>;
  selection = new SelectionModel<Case>(true, []);
  private subscriptions = new Subscription();

  constructor(private route: ActivatedRoute, private service: CaseListService) {
    this.dataSource = new CaseListDataSource(this.service);
    this.subscriptions.add(
      this.dataSource.loading$.subscribe((loading) => {
        if (loading) {
          this.selection.clear();
        }
      })
    );
  }

  ngOnInit(): void {
    this.searchParam$ = this.route.queryParams.pipe(
      map((params) => params['search'] as string),
      first((search) => search != null)
    );
  }

  ngOnDestroy(): void {
    this.sortStore.dispose();
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    const caseType$ = merge<string>(
      of(this.caseType.value),
      this.caseType.change.pipe(map((e) => e.value))
    );
    const search$ = merge(
      of(''),
      this.searchParam$,
      fromEvent<InputEvent>(this.search.nativeElement, 'input').pipe(
        map((e) => {
          const input = e.target as HTMLInputElement;
          return input.value.trim();
        }),
        debounceTime(500),
        distinctUntilChanged()
      )
    );
    const { active, direction } = this.sort;
    const sort$ = merge<Sort>(of({ active, direction }), this.sort.sortChange);
    const page: Page = this.paginator;
    const paginator$ = merge<Page>(of(page), this.paginator.page);

    const input$: Observable<FetchInput> = combineLatest([
      caseType$,
      search$,
      sort$,
      paginator$,
    ]).pipe(
      map(([type, search, sort, { pageIndex, pageSize }]) => ({
        type,
        search,
        sort,
        pageIndex,
        pageSize,
      })),
      checkSearch(this.paginator)
    );
    this.subscriptions.add(input$.subscribe(this.dataSource.fetch_));
    this.subscriptions.add(
      this.sort.sortChange.subscribe(this.sortStore.sort_)
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.source.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.source.forEach((row) => this.selection.select(row));
    }
  }
}

function checkSearch(
  paginator: MatPaginator
): OperatorFunction<FetchInput, FetchInput> {
  let previousSearch: string = '';
  return map(({ type, search, sort, pageIndex, pageSize }) => {
    if (search != previousSearch) {
      console.log(`Search changed ${previousSearch} -> ${search}`);
      if (paginator.pageIndex > 0) {
        pageIndex = 0;
        paginator.pageIndex = pageIndex;
      }
    }
    previousSearch = search;
    return { type, search, sort, pageIndex, pageSize };
  });
}

import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { fromEvent, merge, of, combineLatest, Observable, Subject, OperatorFunction, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FetchInput, Sort, CaseListDataSource } from './case-list.datasource';
import { Case } from './case-list.models';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CaseListService } from './case-list.service';

type Page = {
	pageIndex: number;
	pageSize: number;
};

@Component({
	selector: 'app-case-list',
	templateUrl: './case-list.component.html',
	styleUrls: [ './case-list.component.css' ]
})
export class CaseListComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('search') search: ElementRef<HTMLInputElement>;
	@ViewChild('caseType', { read: MatButtonToggleGroup })
	caseType: MatButtonToggleGroup;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	defaultCaseType = 'active';
	displayedColumns: string[] = [ 'id', 'brand', 'model' ];
	dataSource: CaseListDataSource;
	private subscriptions = new Subscription();

	constructor(private service: CaseListService) {
		this.dataSource = new CaseListDataSource(this.service);
	}
	ngOnInit(): void {}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	ngAfterViewInit(): void {
		const caseType$ = merge<string>(of(this.caseType.value), this.caseType.change.pipe(map((e) => e.value)));
		const search$ = merge(
			of(''),
			fromEvent<InputEvent>(this.search.nativeElement, 'input').pipe(
				map((e) => {
					const input = e.target as HTMLInputElement;
					return input.value.trim();
				}),
				debounceTime(500),
				distinctUntilChanged()
			)
		);
		const sort$ = merge<Sort>(of({}), this.sort.sortChange);
		const page: Page = this.paginator;
		const paginator$ = merge<Page>(of(page), this.paginator.page);

		const input$: Observable<FetchInput> = combineLatest([ caseType$, search$, sort$, paginator$ ]).pipe(
			map(([ type, search, sort, { pageIndex, pageSize } ]) => ({ type, search, sort, pageIndex, pageSize })),
			checkSearch(this.paginator)
		);
		this.subscriptions.add(input$.subscribe(this.dataSource.fetch_));
	}
}

function checkSearch(paginator: MatPaginator): OperatorFunction<FetchInput, FetchInput> {
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

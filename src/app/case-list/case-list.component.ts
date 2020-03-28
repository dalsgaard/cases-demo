import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, merge, of, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FetchCasesInput, Sort } from './case-list.datasource';
import { Case } from './case-list.models';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

type Page = {
	pageIndex: number;
	pageSize: number;
};

@Component({
	selector: 'app-case-list',
	templateUrl: './case-list.component.html',
	styleUrls: [ './case-list.component.css' ]
})
export class CaseListComponent implements OnInit, AfterViewInit {
	@ViewChild('search') search: ElementRef<HTMLInputElement>;
	@ViewChild('caseType', { read: MatButtonToggleGroup })
	caseType: MatButtonToggleGroup;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	defaultCaseType = 'active';
	displayedColumns: string[] = [ 'id', 'brand', 'model' ];
	cases: Case[] = [
		{ id: '101', brand: 'Simca', model: '1307' },
		{ id: '201', brand: 'Simca', model: '1308' },
		{ id: '302', brand: 'Simca', model: '1100' },
		{ id: '303', brand: 'Talbot', model: '1308' },
		{ id: '304', brand: 'Talbot', model: 'Samba' }
	];

	constructor() {}

	ngOnInit(): void {}

	ngAfterViewInit(): void {
		console.log(this.paginator);
		const caseType$ = merge<string>(of(this.caseType.value), this.caseType.change.pipe(map((e) => e.value)));
		const search$ = merge(
			of(''),
			fromEvent<InputEvent>(this.search.nativeElement, 'input').pipe(
				map((e) => {
					const input = e.target as HTMLInputElement;
					return input.value;
				})
			)
		);
		const sort$ = merge<Sort>(of({}), this.sort.sortChange);
		const page: Page = this.paginator;
		const paginator$ = merge<Page>(of(page), this.paginator.page);
		const input$: Observable<FetchCasesInput> = combineLatest([ caseType$, search$, sort$, paginator$ ]).pipe(
			map(([ type, search, sort, { pageIndex, pageSize } ]) => ({ type, search, sort, pageIndex, pageSize }))
		);
		input$.subscribe(console.log);
	}
}

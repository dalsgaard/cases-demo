import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Case } from './case-list.models';
import { delay } from 'rxjs/operators';
import { Sort } from '../utils/sort';

const ACTIVE_LIST: Case[] = [
	{ id: '101', brand: 'Simca', model: '1307' },
	{ id: '201', brand: 'Simca', model: '1308' },
	{ id: '302', brand: 'Simca', model: '1100' },
	{ id: '303', brand: 'Talbot', model: '1308' },
	{ id: '304', brand: 'Talbot', model: 'Samba' },
	{ id: '401', brand: 'Opel', model: 'Kadett' },
	{ id: '501', brand: 'Opel', model: 'Manta' },
	{ id: '602', brand: 'Opel', model: 'Ascona' },
	{ id: '603', brand: 'Ford', model: 'Escort' },
	{ id: '604', brand: 'Ford', model: 'Capri' }
];

const CANCELED_LIST: Case[] = [
	{ id: '101', brand: 'Simca', model: '1307' },
	{ id: '302', brand: 'Simca', model: '1100' },
	{ id: '303', brand: 'Talbot', model: '1308' },
	{ id: '401', brand: 'Opel', model: 'Kadett' },
	{ id: '602', brand: 'Opel', model: 'Ascona' },
	{ id: '604', brand: 'Ford', model: 'Capri' }
];

export type CaseListResponse = {
	items: Case[];
	count: number;
};

export interface CaseListApi {
	fetchCaseList(
		type: string,
		pageIndex: number,
		pageSize: number,
		search: string,
		sort: Sort
	): Observable<CaseListResponse>;
}

@Injectable({
	providedIn: 'root'
})
export class CaseListService {
	constructor() {}

	fetchCaseList(
		type: string,
		pageIndex: number,
		pageSize: number,
		search: string,
		sort: Sort
	): Observable<CaseListResponse> {
		console.log(type);
		let list = type === 'canceled' ? CANCELED_LIST : ACTIVE_LIST;
		const start = pageIndex * pageSize;
		list = sortCaseList(searchCaseList(list, search), sort);
		const count = list.length;
		const items = list.slice(start, start + pageSize);
		console.log('Fetch...', items, count, sort);
		const response: CaseListResponse = { items, count };
		return of(response).pipe(delay(1000));
	}
}

function sortCaseList(list: Case[], sort: Sort): Case[] {
	if (sort.direction) {
		const d = sort.direction === 'asc' ? 1 : -1;
		const l = [ ...list ];
		return l.sort((a, b) => {
			const p = sort.active;
			if (a[p] < b[p]) {
				return -1 * d;
			}
			if (a[p] > b[p]) {
				return 1 * d;
			}
			return 0;
		});
	} else {
		return list;
	}
}

function searchCaseList(list: Case[], search: string): Case[] {
	if (search) {
		return list.filter(({ id }) => id.includes(search));
	} else {
		return list;
	}
}

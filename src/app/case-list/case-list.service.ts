import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Case } from './case-list.models';
import { delay } from 'rxjs/operators';

const CASE_LIST: Case[] = [
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

export type Sort = {
	active?: string;
	direction?: 'asc' | 'desc' | '';
};

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
		const start = pageIndex * pageSize;
		const list = CASE_LIST;
		const count = list.length;
		const items = CASE_LIST.slice(start, start + pageSize);
		const response: CaseListResponse = { items, count };
		return of(response).pipe(delay(1000));
	}
}

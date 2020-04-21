import { DataSource } from '@angular/cdk/table';
import { Case } from './case-list.models';
import { CollectionViewer } from '@angular/cdk/collections';
import { Observable, Subscriber, BehaviorSubject, Subscription } from 'rxjs';
import { CaseListApi, CaseListResponse } from './case-list.service';
import { map, concatAll, share } from 'rxjs/operators';
import { Sort, Next, createNext } from '../utils';

export type FetchInput = {
	type: string;
	search: string;
	sort: Sort;
	pageIndex: number;
	pageSize: number;
};

export class CaseListDataSource implements DataSource<Case> {
	public fetch_: Next<FetchInput>;
	private fetch$: Observable<FetchInput>;
	private _source$ = new BehaviorSubject<Case[]>([]);
	private _count$ = new BehaviorSubject<number>(0);
	private _loading$ = new BehaviorSubject<boolean>(false);
	private subscriptions = new Subscription();

	public get source$(): Observable<Case[]> {
		return this._source$;
	}
	public get count$(): Observable<number> {
		return this._count$;
	}
	public get loading$(): Observable<boolean> {
		return this._loading$;
	}

	constructor(private api: CaseListApi) {
		this.fetch$ = new Observable<FetchInput>((subscriber) => {
			this.fetch_ = createNext(subscriber);
		}).pipe(share());
		this.subscriptions.add(this.fetch$.pipe(map((input) => true)).subscribe(this._loading$));
		const response$: Observable<CaseListResponse> = this.fetch$.pipe(
			map(({ type, search, sort, pageIndex, pageSize }) => {
				return this.api.fetchCaseList(type, pageIndex, pageSize, search, sort);
			}),
			concatAll(),
			share()
		);
		this.subscriptions.add(response$.pipe(map(({ items }) => items)).subscribe(this._source$));
		this.subscriptions.add(response$.pipe(map(({ count }) => count)).subscribe(this._count$));
		this.subscriptions.add(response$.pipe(map((res) => !res)).subscribe(this._loading$));
	}

	connect(collectionViewer: CollectionViewer): Observable<Case[]> {
		return this._source$;
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this.subscriptions.unsubscribe();
	}
}

export { Sort };

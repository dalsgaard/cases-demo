import { DataSource } from '@angular/cdk/table';
import { Case } from './case-list.models';
import { CollectionViewer } from '@angular/cdk/collections';
import { Observable, Subscriber, BehaviorSubject } from 'rxjs';
import { Sort, CaseListApi, CaseListResponse } from './case-list.service';
import { map, concatAll, share } from 'rxjs/operators';

export type FetchInput = {
	type: string;
	search: string;
	sort: Sort;
	pageIndex: number;
	pageSize: number;
};

interface Next<T> {
	next(input: T): void;
}

class NextImpl<T> implements Next<T> {
	constructor(private subscriber: Subscriber<T>) {}

	next(input: T) {
		this.subscriber.next(input);
	}
}

export class CaseListDataSource implements DataSource<Case> {
	public fetch_: Next<FetchInput>;
	private fetch$: Observable<FetchInput>;
	private _source$ = new BehaviorSubject<Case[]>([]);
	private _count$ = new BehaviorSubject<number>(0);

	public get source$(): Observable<Case[]> {
		return this._source$;
	}
	public get count$(): Observable<number> {
		return this._count$;
	}

	constructor(private api: CaseListApi) {
		this.fetch$ = new Observable((Subscriber) => {
			this.fetch_ = new NextImpl(Subscriber);
		});
		const response$: Observable<CaseListResponse> = this.fetch$.pipe(
			map(({ type, search, sort, pageIndex, pageSize }) => {
				return this.api.fetchCaseList(type, pageIndex, pageSize, search, sort);
			}),
			concatAll(),
			share()
		);
		response$.pipe(map(({ items }) => items)).subscribe(this._source$);
		response$.pipe(map(({ count }) => count)).subscribe(this._count$);
	}

	connect(collectionViewer: CollectionViewer): Observable<Case[]> {
		return this._source$;
	}
	disconnect(collectionViewer: CollectionViewer): void {}
}

export { Sort };

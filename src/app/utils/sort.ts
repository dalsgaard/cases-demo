import { Observable, Subscription } from 'rxjs';
import { Next, createNext } from './next';

export type Sort = {
	active?: string;
	direction?: 'asc' | 'desc' | '';
};

export class SortStore {
	public sort_: Next<Sort>;
	private key: string;
	private _sort?: Sort;
	private _sort$: Observable<Sort>;
	private subscriptions = new Subscription();

	public get sort(): Sort | null {
		return this._sort;
	}

	constructor(prefix: string) {
		this.key = `${prefix}.sort`;
		this._sort = this.readSort();
		this._sort$ = new Observable((subscriber) => {
			this.sort_ = createNext(subscriber);
		});
		this.subscriptions.add(
			this._sort$.subscribe({
				next: (sort) => {
					this.writeSort(sort);
				}
			})
		);
	}

	public dispose(): void {
		this.subscriptions.unsubscribe();
	}

	private readSort(): Sort | null {
		return JSON.parse(localStorage.getItem(this.key)) as Sort | null;
	}

	private writeSort(sort: Sort | null) {
		console.log(sort);
		if (sort) {
			localStorage.setItem(this.key, JSON.stringify(sort));
		} else {
			localStorage.removeItem(this.key);
		}
	}
}

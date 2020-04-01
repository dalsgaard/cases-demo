import { Subscriber } from 'rxjs';

export interface Next<T> {
	next(input: T): void;
}

class NextImpl<T> implements Next<T> {
	constructor(private subscriber: Subscriber<T>) {}

	next(input: T) {
		this.subscriber.next(input);
	}
}

export function createNext<T>(subscriber: Subscriber<T>): Next<T> {
	return new NextImpl<T>(subscriber);
}

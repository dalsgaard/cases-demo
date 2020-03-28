export type FetchCasesInput = {
	type: string;
	search: string;
	sort: Sort;
	pageIndex: number;
	pageSize: number;
};

export type Sort = {
	active?: string;
	direction?: 'asc' | 'desc' | '';
};

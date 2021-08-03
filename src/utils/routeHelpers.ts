export function isNextPageAvailable(dbCount: number, returnedQueryLength: number, pageSizeAmount: number): boolean {
	if (dbCount - returnedQueryLength === 0) return false;
	if (dbCount - returnedQueryLength - pageSizeAmount === 0) return false;
	return true;
}

export function isPrevPageAvailable(pageSizeAmount: number): boolean {
	if (pageSizeAmount > 0) return true;
	return false;
}

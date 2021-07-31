export const addMinsToCurrentDate = (mins: number): Date => {
	const currentDate = new Date();
	const minsCalculation = mins * 60 * 1000;
	const futureDate = new Date(currentDate.getTime() + minsCalculation);
	return futureDate;
};

import * as Yup from "yup";
export const commonValidationOptions = {
	validateOptions: { abortEarly: false },
};

export const commonPaginationOptions = {
	pageSize: Yup.number().positive(),
	page: Yup.number().positive(),
	sortDirection: Yup.string().oneOf(["ASC", "DESC"]),
};

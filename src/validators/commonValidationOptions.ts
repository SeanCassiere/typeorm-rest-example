import * as Yup from "yup";
export const commonValidationOptions = {
	validateOptions: { abortEarly: false },
};

export const commonPaginationOptions = {
	limit: Yup.number().positive(),
	offset: Yup.number().min(0),
	sortDirection: Yup.string().oneOf(["ASC", "DESC"]),
};

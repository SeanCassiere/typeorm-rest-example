import { ExpressYupMiddlewareInterface } from "express-yup-middleware";
import * as Yup from "yup";

import { commonPaginationOptions, commonValidationOptions } from "./commonValidationOptions";
import {
	confirmUserBodySchema,
	userLoginBodySchema,
	registerUserBodySchema,
	selfUserUpdateBodySchema,
	resendConfirmationSchema,
	resetPasswordWithTokenSchema,
	adminUserUpdateBodySchema,
} from "./users/userValidationSchema";

export const userLoginValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: userLoginBodySchema,
			...commonValidationOptions,
		},
	},
};

export const confirmUserValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: confirmUserBodySchema,
			...commonValidationOptions,
		},
	},
};

export const registerUserValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: registerUserBodySchema,
			...commonValidationOptions,
		},
	},
};

export const selfUpdateUserValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: selfUserUpdateBodySchema,
			...commonValidationOptions,
		},
	},
};

export const bodyEmailOnlyValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: resendConfirmationSchema,
			...commonValidationOptions,
		},
	},
};

export const resetPasswordWithTokenValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: resetPasswordWithTokenSchema,
			...commonValidationOptions,
		},
	},
};

export const adminUpdateUserValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: adminUserUpdateBodySchema,
			...commonValidationOptions,
		},
	},
};

export const adminGetAllUsersValidator: ExpressYupMiddlewareInterface = {
	schema: {
		query: {
			yupSchema: Yup.object().shape({
				...commonPaginationOptions,
			}),
			...commonValidationOptions,
		},
	},
};

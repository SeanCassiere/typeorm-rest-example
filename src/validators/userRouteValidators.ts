import { ExpressYupMiddlewareInterface } from "express-yup-middleware";
import { commonValidationOptions } from "./commonValidationOptions";

import { userLoginBodySchema } from "./users/userValidationSchema";

export const userLoginValidator: ExpressYupMiddlewareInterface = {
	schema: {
		body: {
			yupSchema: userLoginBodySchema,
			...commonValidationOptions,
		},
	},
};

import { Router } from "express";
import { expressYupMiddleware } from "express-yup-middleware";

import { isAdmin, protect } from "../middleware/authMiddleware";

import {
	adminDeleteUserById,
	adminGetAllUsers,
	adminGetUserById,
	adminUpdateUserById,
	authUser,
	confirmUser,
	getUserProfile,
	registerUser,
	resendConfirmation,
	resetPasswordWithToken,
	sendResetPasswordEmail,
	updateUserProfile,
} from "../controllers/userControllers";
import {
	confirmUserValidator,
	registerUserValidator,
	selfUpdateUserValidator,
	userLoginValidator,
	bodyEmailOnlyValidator,
	resetPasswordWithTokenValidator,
} from "../validators/userRouteValidators";

const userRouter = Router();

userRouter
	.route("/")
	.get(protect, isAdmin, adminGetAllUsers)
	.post(expressYupMiddleware({ schemaValidator: registerUserValidator, expectedStatusCode: 400 }), registerUser);

userRouter
	.route("/login")
	.post(expressYupMiddleware({ schemaValidator: userLoginValidator, expectedStatusCode: 400 }), authUser);

userRouter
	.route("/profile")
	.get(protect, getUserProfile)
	.put(
		protect,
		expressYupMiddleware({ schemaValidator: selfUpdateUserValidator, expectedStatusCode: 400 }),
		updateUserProfile
	);

userRouter
	.route("/confirmUser")
	.post(expressYupMiddleware({ schemaValidator: confirmUserValidator, expectedStatusCode: 400 }), confirmUser);

userRouter
	.route("/resendConfirmationEmail")
	.post(expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator, expectedStatusCode: 400 }), resendConfirmation);

userRouter
	.route("/sendForgotPasswordEmail")
	.post(
		expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator, expectedStatusCode: 400 }),
		sendResetPasswordEmail
	);

userRouter
	.route("/resetPassword")
	.post(
		expressYupMiddleware({ schemaValidator: resetPasswordWithTokenValidator, expectedStatusCode: 400 }),
		resetPasswordWithToken
	);

userRouter
	.route("/:id")
	.delete(protect, isAdmin, adminDeleteUserById)
	.get(protect, isAdmin, adminGetUserById)
	.put(protect, isAdmin, adminUpdateUserById);

export { userRouter };

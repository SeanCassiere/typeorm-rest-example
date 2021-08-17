import { Router } from "express";
import { expressYupMiddleware } from "express-yup-middleware";

import { isAdmin, protect, isRefreshCookieValid } from "#root/middleware/authMiddleware";
import { registerRouteRateLimiter } from "#root/middleware/rateLimitMiddleware";
import {
	confirmUserValidator,
	registerUserValidator,
	selfUpdateUserValidator,
	userLoginValidator,
	bodyEmailOnlyValidator,
	bodyTokenOnlyValidatory,
	adminUpdateUserValidator,
	adminGetAllUsersValidator,
} from "#root/validators/userRouteValidators";
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
	refreshUserAccessTokenFromCookie,
	logoutUser,
	sendChangeEmailConfirmation,
	confirmChangeEmail,
} from "#root/controllers/userControllers";

const userRouter = Router();

userRouter
	.route("/")
	.get(protect, isAdmin, expressYupMiddleware({ schemaValidator: adminGetAllUsersValidator }), adminGetAllUsers)
	.post(expressYupMiddleware({ schemaValidator: registerUserValidator }), registerRouteRateLimiter, registerUser);

userRouter.route("/login").post(expressYupMiddleware({ schemaValidator: userLoginValidator }), authUser);

userRouter.route("/logout").get(logoutUser);

userRouter.route("/refreshToken").get(isRefreshCookieValid, refreshUserAccessTokenFromCookie);

userRouter
	.route("/profile")
	.get(protect, getUserProfile)
	.put(protect, expressYupMiddleware({ schemaValidator: selfUpdateUserValidator }), updateUserProfile);

userRouter
	.route("/confirmUser")
	.post(expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator }), resendConfirmation)
	.put(expressYupMiddleware({ schemaValidator: confirmUserValidator }), confirmUser);

userRouter
	.route("/changeEmail")
	.post(protect, expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator }), sendChangeEmailConfirmation)
	.put(expressYupMiddleware({ schemaValidator: bodyTokenOnlyValidatory }), confirmChangeEmail);

userRouter
	.route("/resetPassword")
	.post(expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator }), sendResetPasswordEmail)
	.put(expressYupMiddleware({ schemaValidator: bodyTokenOnlyValidatory }), resetPasswordWithToken);

userRouter
	.route("/:id")
	.delete(protect, isAdmin, adminDeleteUserById)
	.get(protect, isAdmin, adminGetUserById)
	.put(protect, isAdmin, expressYupMiddleware({ schemaValidator: adminUpdateUserValidator }), adminUpdateUserById);

export { userRouter };

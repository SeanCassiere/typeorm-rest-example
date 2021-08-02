import { Router } from "express";
import { expressYupMiddleware } from "express-yup-middleware";

import { isAdmin, protect, isRefreshCookieValid } from "../middleware/authMiddleware";
import { registerRouteRateLimiter } from "../middleware/rateLimitMiddleware";
import {
	confirmUserValidator,
	registerUserValidator,
	selfUpdateUserValidator,
	userLoginValidator,
	bodyEmailOnlyValidator,
	resetPasswordWithTokenValidator,
	adminUpdateUserValidator,
	adminGetAllUsersValidator,
} from "../validators/userRouteValidators";
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
} from "../controllers/userControllers";

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
	.route("/resetPassword")
	.post(expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator }), sendResetPasswordEmail)
	.put(expressYupMiddleware({ schemaValidator: resetPasswordWithTokenValidator }), resetPasswordWithToken);

userRouter
	.route("/:id")
	.delete(protect, isAdmin, adminDeleteUserById)
	.get(protect, isAdmin, adminGetUserById)
	.put(protect, isAdmin, expressYupMiddleware({ schemaValidator: adminUpdateUserValidator }), adminUpdateUserById);

export { userRouter };

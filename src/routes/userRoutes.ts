import { Router } from "express";
import { expressYupMiddleware } from "express-yup-middleware";

import { isAdmin, protect } from "../middleware/authMiddleware";
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
} from "../controllers/userControllers";

const userRouter = Router();

userRouter
	.route("/")
	.get(protect, isAdmin, expressYupMiddleware({ schemaValidator: adminGetAllUsersValidator }), adminGetAllUsers)
	.post(expressYupMiddleware({ schemaValidator: registerUserValidator }), registerUser);

userRouter.route("/login").post(expressYupMiddleware({ schemaValidator: userLoginValidator }), authUser);

userRouter
	.route("/profile")
	.get(protect, getUserProfile)
	.put(protect, expressYupMiddleware({ schemaValidator: selfUpdateUserValidator }), updateUserProfile);

userRouter.route("/confirmUser").post(expressYupMiddleware({ schemaValidator: confirmUserValidator }), confirmUser);

userRouter
	.route("/resendConfirmationEmail")
	.post(expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator }), resendConfirmation);

userRouter
	.route("/sendForgotPasswordEmail")
	.post(expressYupMiddleware({ schemaValidator: bodyEmailOnlyValidator }), sendResetPasswordEmail);

userRouter
	.route("/resetPassword")
	.post(expressYupMiddleware({ schemaValidator: resetPasswordWithTokenValidator }), resetPasswordWithToken);

userRouter
	.route("/:id")
	.delete(protect, isAdmin, adminDeleteUserById)
	.get(protect, isAdmin, adminGetUserById)
	.put(protect, isAdmin, expressYupMiddleware({ schemaValidator: adminUpdateUserValidator }), adminUpdateUserById);

export { userRouter };

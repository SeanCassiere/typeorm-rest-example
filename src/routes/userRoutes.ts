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
import { userLoginValidator } from "../validators/userRouteValidators";

const userRouter = Router();

userRouter.route("/").get(protect, isAdmin, adminGetAllUsers).post(registerUser);

userRouter
	.route("/login")
	.post(expressYupMiddleware({ schemaValidator: userLoginValidator, expectedStatusCode: 400 }), authUser);

userRouter.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

userRouter.route("/confirmUser").post(confirmUser);

userRouter.route("/resendConfirmationEmail").post(resendConfirmation);

userRouter.route("/sendForgotPasswordEmail").post(sendResetPasswordEmail);

userRouter.route("/resetPassword").post(resetPasswordWithToken);

userRouter
	.route("/:id")
	.delete(protect, isAdmin, adminDeleteUserById)
	.get(protect, isAdmin, adminGetUserById)
	.put(protect, isAdmin, adminUpdateUserById);

export { userRouter };

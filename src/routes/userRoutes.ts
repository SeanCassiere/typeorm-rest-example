import { Router } from "express";

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
	updateUserProfile,
} from "../controllers/userControllers";

const userRouter = Router();

userRouter.route("/").get(protect, isAdmin, adminGetAllUsers).post(registerUser);

userRouter.route("/login").post(authUser);

userRouter.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

userRouter.route("/confirmUser").post(confirmUser);

userRouter.route("/resendConfirmationEmail").post(resendConfirmation);

userRouter
	.route("/:id")
	.delete(protect, isAdmin, adminDeleteUserById)
	.get(protect, isAdmin, adminGetUserById)
	.put(protect, isAdmin, adminUpdateUserById);

export { userRouter };

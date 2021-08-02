import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";
import { decode } from "jsonwebtoken";

import { generateToken } from "../utils/generateToken";
import { CustomRequest } from "../interfaces/expressInterfaces";
import { redis } from "../redis";
import { createConfirmationUrl } from "../utils/email/createConfirmationURL";
import { createResetPasswordURL } from "../utils/email/createResetPasswordURL";
import { createChangeEmailUrl } from "../utils/email/createChangeEmailURL";
import { sendEmail } from "../utils/email/sendEmail";
import { changeEmailPrefix, confirmationEmailPrefix, forgotPasswordPrefix } from "../utils/constants/redisPrefixes";
import { hashPasswordForUser } from "../utils/hashPasswordForUser";
import { addMinsToCurrentDate } from "../utils/addMinsToCurrentDate";

import { User } from "../entities/User";

// @desc Get all users for Admin
// @route GET /api/users
// @access Private/Admin
export const adminGetAllUsers = asyncHandler(async (req, res, next) => {
	const query = User.createQueryBuilder().select();

	// Id sort direction
	if (req.query && req.query.sortDirection && req.query.sortDirection === "DESC") {
		query.addOrderBy("id", req.query.sortDirection);
	} else {
		query.addOrderBy("id", "ASC");
	}
	// DB response size
	if (req.query && req.query.limit) {
		const limit = req.query.limit as any;
		query.take(limit);
	}
	// DB response item offset
	if (req.query && req.query.limit) {
		const skip = req.query.offset as any;
		query.skip(skip);
	}
	// DB name search from firstName, lastName or email
	if (req.query && req.query.search) {
		const search = req.query.search as string;
		query.where("first_name ILIKE :first", { first: `%${search.toLowerCase()}%` });
		query.orWhere("last_name ILIKE :last", { last: `%${search.toLowerCase()}%` });
		query.orWhere("email ILIKE :emaila", { emaila: `%${search.toLowerCase()}%` });
	}
	try {
		const usersQuery = await query.getMany();
		res.json(usersQuery);
	} catch (error) {
		res.status(500);
		next("Error with the database search");
	}
});

// @desc Get user by ID for Admin
// @route GET /api/users/:id
// @access Private/Admin
export const adminGetUserById = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (user) {
		res.json(user);
	} else {
		res.status(404);
		next(new Error("User not found"));
	}
});

// @desc Delete user by id for Admin
// @route DELETE /api/users/:id
// @access Private/Admin
export const adminDeleteUserById = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (user) {
		user.isActive = false;
		await user.save();
		res.json({ message: "User removed" });
	} else {
		res.status(404);
		next(new Error("User not found"));
	}

	res.json(user);
});

// @desc Update user by Admin
// @route PUT /api/users/:id
// @access Private/Admin
export const adminUpdateUserById = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (user) {
		user.firstName = req.body.name || user.firstName;
		user.lastName = req.body.name || user.lastName;
		user.email = req.body.email || user.email;
		user.isActive = req.body.isActive || user.isActive;
		user.isAdmin = req.body.isAdmin || user.isActive;
		user.isEmailConfirmed = req.body.isEmailConfirmed || user.isEmailConfirmed;

		const updatedUser = await user.save();

		res.json(updatedUser);
	} else {
		res.status(404);
		next(new Error("User not found"));
	}
});

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
export const authUser = asyncHandler(async (req: CustomRequest<{ email: string; password: string }>, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ where: { email } });

	if (user && !user.isEmailConfirmed) {
		res.status(401);
		next(new Error("Email not confirmed"));
	}

	if (user && (await bcryptjs.compare(password, user.password))) {
		const accessToken = generateToken("ACCESS_TOKEN", { id: `${user.id}` }, 30);

		const refreshTokenDuration = 60 * 18;
		const cookieExpirationDate = addMinsToCurrentDate(refreshTokenDuration);
		const refreshToken = generateToken("REFRESH_TOKEN", { id: `${user.id}` }, refreshTokenDuration);
		res
			.cookie("refreshToken", refreshToken, {
				secure: process.env.NODE_ENV === "production" ? true : false,
				httpOnly: true,
				expires: cookieExpirationDate,
				signed: true,
			})
			.json({
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isAdmin: user.isAdmin,
				isEmailConfirmed: user.isEmailConfirmed,
				token: accessToken,
				refreshToken,
			});
	} else {
		res.status(401);
		next(new Error("Invalid email or password"));
	}
});

// @desc Refresh the user access token
// @route GET /api/users/refreshAuth
// @access Private
export const refreshUserAccessTokenFromCookie = asyncHandler(async (req: CustomRequest<{}>, res) => {
	const accessToken = generateToken("ACCESS_TOKEN", { id: `${req.user!.id}` }, 30);
	res.json({ token: accessToken });
});

// @desc Clear refreshToken cookie and logout
// @route GET /api/users/logout
// @access Public
export const logoutUser = asyncHandler(async (_, res) => {
	res.cookie("refreshToken", "expiring now", { expires: new Date(Date.now()) }).json({ success: true });
});

// @desc Confirm user with token from email
// @route PUT /api/users/confirmUser
// @access Public
export const confirmUser = asyncHandler(async (req: CustomRequest<{ token: string }>, res, next) => {
	const { token } = req.body;

	const userId = await redis.get(confirmationEmailPrefix + token);

	if (!userId) {
		res.status(401);
		next(new Error("Token missing, please request new token"));
	}

	const user = await User.findOne({ where: { id: userId } });

	if (user) {
		user.isEmailConfirmed = true;
		await user.save();

		res.json({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: user.isAdmin,
			isEmailConfirmed: user.isEmailConfirmed,
		});
	} else {
		res.status(500);
		next(new Error("Could not find user in database"));
	}
});

// @desc Request new confirmation email
// @route POST /api/users/confirmUser
// @access Public
export const resendConfirmation = asyncHandler(async (req: CustomRequest<{ email: string }>, res) => {
	const { email } = req.body;

	const user = await User.findOne({ where: { email: email.toLowerCase() } });

	if (!user) res.status(200).json({ message: "Success" });
	if (user && user.isEmailConfirmed) res.status(200).json({ message: "Success" });

	if (user) {
		await sendEmail(user.email, await createConfirmationUrl(user.id));
		res.status(200).json({ message: "Success" });
	}
});

// @desc Register a new user
// @route POST /api/users
// @access Public
export const registerUser = asyncHandler(
	async (req: CustomRequest<{ firstName: string; lastName: string; email: string; password: string }>, res, next) => {
		const { firstName, lastName, email, password } = req.body;

		const userExists = await User.findOne({ where: { email: email } });

		if (userExists) {
			res.status(400);
			next(new Error("User already exists"));
		} else {
			const newPassword = await hashPasswordForUser(password);

			const user = await User.create({
				firstName,
				lastName,
				email: email.toLowerCase(),
				password: newPassword,
			}).save();

			await sendEmail(user.email, await createConfirmationUrl(user.id));

			if (user) {
				res.status(201).json({
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					isAdmin: user.isAdmin,
					isEmailConfirmed: user.isEmailConfirmed,
				});
			} else {
				res.status(400);
				next(new Error("Invalid user data"));
			}
		}
	}
);

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req: CustomRequest<{}>, res, next) => {
	const user = req.user;
	if (user) {
		res.json({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: user.isAdmin,
			isEmailConfirmed: user.isEmailConfirmed,
		});
	} else {
		res.status(404);
		next(new Error("User not found"));
	}
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(
	async (req: CustomRequest<{ firstName?: string; lastName?: string; password?: string }>, res, next) => {
		const user = req.user;
		if (user) {
			user.firstName = req.body.firstName || user.firstName;
			user.lastName = req.body.lastName || user.lastName;
			if (req.body && req.body.password) {
				user.password = await bcryptjs.hash(req.body.password, 12);
			}

			try {
				const updatedUser = await user.save();

				res.json({
					id: updatedUser.id,
					firstName: updatedUser.firstName,
					lastName: updatedUser.lastName,
					email: updatedUser.email,
					isAdmin: updatedUser.isAdmin,
					isEmailConfirmed: updatedUser.isEmailConfirmed,
				});
			} catch (error) {
				res.status(500);
				next(new Error("User updating error"));
			}
		} else {
			res.status(404);
			next(new Error("User not found"));
		}
	}
);

// @desc Request new confirmation email
// @route POST /api/users/resetPassword
// @access Public
export const sendResetPasswordEmail = asyncHandler(async (req: CustomRequest<{ email: string }>, res) => {
	const { email } = req.body;

	const user = await User.findOne({ where: { email: email.toLowerCase() } });

	if (!user) res.status(200).json({ message: "Success" });

	if (user) {
		await sendEmail(user.email, await createResetPasswordURL(user.id));
		res.status(200).json({ message: "Success" });
	}
});

// @desc Request new confirmation email
// @route PUT /api/users/resetPassword
// @access Public
export const resetPasswordWithToken = asyncHandler(
	async (req: CustomRequest<{ token: string; password: string }>, res, next) => {
		const { token, password } = req.body;

		const userId = await redis.get(forgotPasswordPrefix + token);

		if (!userId) {
			res.status(401);
			next(new Error("Token invalid, please request new token"));
		}

		const user = await User.findOne({ where: { id: userId } });

		if (!user) res.status(200).json({ message: "Success" });

		if (user) {
			user.password = await hashPasswordForUser(password);
			await user.save();
			res.status(200).json({ message: "Success" });
		}
	}
);

// @desc Send confirmation email to new email address
// @route POST /api/users/changeEmail
// @access Private
export const sendChangeEmailConfirmation = asyncHandler(async (req: CustomRequest<{ email: string }>, res) => {
	const user = req.user!;
	const { email } = req.body;
	await sendEmail(email, await createChangeEmailUrl({ id: `${user.id}`, email }));
	res.status(200).json({ message: "Success" });
});

// @desc Confirm new email change
// @route PUT /api/users/changeEmail
// @access Public
export const confirmChangeEmail = asyncHandler(async (req: CustomRequest<{ token: string }>, res, next) => {
	let userOptions: { id: string; email: string } = { id: "", email: "" };
	const { token } = req.body;

	const changeOptionsJWT = await redis.get(changeEmailPrefix + token);

	if (!changeOptionsJWT) {
		res.status(401);
		next(new Error("Token invalid, please request new token"));
	}

	try {
		const decoded = decode(changeOptionsJWT!) as { id: string; email: string };
		console.log("Decoded", decoded);
		userOptions = decoded;
	} catch (error) {
		res.status(401);
		next(new Error("Token invalid, please request new token"));
	}
	console.log("userOptions", userOptions);
	const user = await User.findOne({ where: { id: userOptions.id } });

	if (!user) res.status(404).json({ message: "User not found" });

	if (user) {
		user.email = userOptions.email;
		await user.save();
		res.status(200).json({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: user.isAdmin,
			isEmailConfirmed: user.isEmailConfirmed,
		});
	}
});

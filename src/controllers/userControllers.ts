import asyncHandler from "express-async-handler";
import bcryptjs from "bcryptjs";

import { generateToken } from "../utils/generateToken";
import { CustomRequest } from "../interfaces/expressInterfaces";
import { redis } from "../redis";
import { createConfirmationUrl } from "../utils/createConfirmationURL";
import { sendEmail } from "../utils/sendEmail";
import { confirmationEmailPrefix } from "../utils/constants/redisPrefixes";

import { User } from "../entities/User";

// @desc Get all users for Admin
// @route GET /api/users
// @access Private/Admin
export const adminGetAllUsers = asyncHandler(async (_, res) => {
	const users = await User.find({});

	res.json(users);
});

// @desc Get user by ID for Admin
// @route GET /api/users/:id
// @access Private/Admin
export const adminGetUserById = asyncHandler(async (req, res) => {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (user) {
		res.json(user);
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

// @desc Delete user by id for Admin
// @route DELETE /api/users/:id
// @access Private/Admin
export const adminDeleteUserById = asyncHandler(async (req, res) => {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (user) {
		user.isActive = false;
		await user.save();
		res.json({ message: "User removed" });
	} else {
		res.status(404);
		throw new Error("User not found");
	}

	res.json(user);
});

// @desc Update user by Admin
// @route PUT /api/users/:id
// @access Private/Admin
export const adminUpdateUserById = asyncHandler(async (req, res) => {
	const user = await User.findOne({ where: { id: req.params.id } });

	if (user) {
		user.firstName = req.body.name || user.firstName;
		user.lastName = req.body.name || user.lastName;
		user.email = req.body.email || user.email;
		user.isActive = req.body.email || user.isActive;
		user.isEmailConfirmed = req.body.email || user.isEmailConfirmed;

		const updatedUser = await user.save();

		res.json({
			id: updatedUser.id,
			firstName: updatedUser.firstName,
			lastName: updatedUser.lastName,
			email: updatedUser.email,
			isActive: updatedUser.isActive,
			isEmailConfirmed: updatedUser.isEmailConfirmed,
		});
	} else {
		res.status(404);
		throw new Error("User not found");
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
		res.json({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			isAdmin: user.isAdmin,
			isEmailConfirmed: user.isEmailConfirmed,
			token: generateToken(`${user.id}`),
		});
	} else {
		res.status(401);
		next(new Error("Invalid email or password"));
	}
});

// @desc Confirm user with token from email
// @route POST /api/users/confirmUser
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
		res.status(401);
		next(new Error("Could not find user in database"));
	}
});

// @desc Request new confirmation email
// @route POST /api/users/resendConfirmationEmail
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
		}

		const newPassword = await bcryptjs.hash(password, 12);

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
);

// @desc Get user profile
// @route GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req: CustomRequest<{}>, res) => {
	const user = await User.findOne({ where: { id: req.user!.id } });

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
		throw new Error("User not found");
	}
});

// @desc Update user profile
// @route PUT /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(
	async (req: CustomRequest<{ firstName?: string; lastName?: string; email?: string; password?: string }>, res) => {
		const user = await User.findOne({ where: { id: req.user!.id } });

		if (user) {
			user.firstName = req.body.firstName || user.firstName;
			user.lastName = req.body.lastName || user.lastName;
			user.email = req.body.email?.toLowerCase() || user.email;
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
					token: generateToken(`${updatedUser.id}`),
				});
			} catch (error) {
				res.status(500);
				throw new Error("User updating error");
			}
		} else {
			res.status(404);
			throw new Error("User not found");
		}
	}
);

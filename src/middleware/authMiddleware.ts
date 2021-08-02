import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import { Secret, verify } from "jsonwebtoken";

import { User } from "../entities/User";
import { GeneratedTokenInterface } from "../interfaces/generatedToken";
import { CustomRequest } from "../interfaces/expressInterfaces";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_jwt_secret";
const REFRESH_JWT_SECRET: Secret = process.env.REFRESH_JWT_SECRET || "dev_refresh_jwt_secret";

export const protect = asyncHandler(async (req: CustomRequest<{}>, res, next: NextFunction) => {
	let token: string = "";

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			token = req.headers.authorization.split(" ")[1];
			const decoded = verify(token, JWT_SECRET) as GeneratedTokenInterface;

			const userFound = await User.findOne({ where: { id: decoded.id } });

			if (userFound && userFound.isActive) {
				req.user = userFound;
			} else if (userFound && !userFound.isActive) {
				res.status(401);
				next(new Error("User account not active. Please contact administrator"));
			} else {
				throw new Error("No User found");
			}

			next();
		} catch (error) {
			console.error(error);
			res.status(401);
			throw new Error("Not Authorized, token failed");
		}
	}

	if (token.length === 0) {
		res.status(401);
		throw new Error("Not authorized, no token");
	}
});

export const isAdmin = asyncHandler(async (req: CustomRequest<{}>, res: Response, next: NextFunction) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(401);
		throw new Error("Not authorized, must be an admin");
	}
});

export const isRefreshCookieValid = asyncHandler(async (req: CustomRequest<{}>, res: Response, next: NextFunction) => {
	if (req.signedCookies && req.signedCookies.refreshToken) {
		const token = req.signedCookies.refreshToken;
		try {
			const decoded = verify(token, REFRESH_JWT_SECRET) as GeneratedTokenInterface;

			const userFound = await User.findOne({ where: { id: decoded.id } });

			if (userFound && userFound.isActive) {
				req.user = userFound;
			} else {
				throw new Error("No User found");
			}
		} catch (error) {
			console.error(error);
			res.status(401);
			throw new Error("Refreshing not Authorized, token failed");
		}
		next();
	} else {
		res.status(401);
		throw new Error("No refreshToken cookie set, request denied");
	}
});

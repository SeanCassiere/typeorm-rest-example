// import { verify, Secret } from "jsonwebtoken";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Secret, verify } from "jsonwebtoken";

import { User } from "../entities/User";
import { GeneratedTokenInterface } from "../interfaces/generatedToken";
import { CustomRequest } from "../interfaces/expressInterfaces";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "";

export const protect = asyncHandler(async (req: CustomRequest<{}>, res, next: NextFunction) => {
	let token: string = "";

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			token = req.headers.authorization.split(" ")[1];
			const decoded = verify(token, JWT_SECRET) as GeneratedTokenInterface;

			const userFound = await User.findOne({ where: { id: decoded.id } });

			if (userFound) {
				req.user = userFound;
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

export const isAdmin = asyncHandler(async (req: CustomRequest<{}>, res, next: NextFunction) => {
	if (req.user && req.user.isAdmin) {
		next();
	} else {
		res.status(401);
		throw Error("Not authorized, must be an admin");
	}
	next();
});

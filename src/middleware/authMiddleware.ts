// import { verify, Secret } from "jsonwebtoken";
import { NextFunction } from "express";
import asyncHandler from "express-async-handler";

// const JWT_SECRET: Secret = process.env.JWT_SECRET || "";

const protect = asyncHandler(async (req, res, next: NextFunction) => {
	let token: string = "";

	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		try {
			token = req.headers.authorization.split(" ")[1];
			// const decoded = verify(token, JWT_SECRET) as TokenInterface;

			// const userFound = await UserModel.findById(decoded.id).select("-password");

			// if (userFound) {
			// 	req.user = userFound;
			// } else {
			// 	throw new Error("No User found");
			// }

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

const isAdmin = asyncHandler(async (_, __, next: NextFunction) => {
	// if (req.user && req.user.isAdmin) {
	// 	next();
	// } else {
	// 	res.status(401);
	// 	throw Error("Not authorized, must be an admin");
	// }
	next();
});

export { protect, isAdmin };

import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_jwt_secret";

export const generateToken = (id: string, mins: number) => {
	return jwt.sign({ id }, JWT_SECRET, {
		expiresIn: `${mins}m`,
	});
};

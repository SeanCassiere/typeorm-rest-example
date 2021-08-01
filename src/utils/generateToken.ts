import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_jwt_secret";
const REFRESH_JWT_SECRET: Secret = process.env.REFRESH_JWT_SECRET || "dev_refresh_jwt_secret";

export const generateToken = (type: "ACCESS_TOKEN" | "REFRESH_TOKEN", id: string, mins: number) => {
	const secret = type === "REFRESH_TOKEN" ? REFRESH_JWT_SECRET : JWT_SECRET;
	return jwt.sign({ id }, secret, {
		expiresIn: `${mins}m`,
	});
};

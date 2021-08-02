import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_jwt_secret";
const REFRESH_JWT_SECRET: Secret = process.env.REFRESH_JWT_SECRET || "dev_refresh_jwt_secret";

interface JWT_PAYLOAD_OPTIONS {
	id: string;
	email?: string;
}

type TOKEN_TYPES = "ACCESS_TOKEN" | "REFRESH_TOKEN";

export const generateToken = (type: TOKEN_TYPES, { id, email }: JWT_PAYLOAD_OPTIONS, mins: number) => {
	let jwtPayload: JWT_PAYLOAD_OPTIONS = { id };
	const secret = type === "REFRESH_TOKEN" ? REFRESH_JWT_SECRET : JWT_SECRET;

	if (email) jwtPayload = { ...jwtPayload, email };

	return jwt.sign({ ...jwtPayload }, secret, {
		expiresIn: `${mins}m`,
	});
};

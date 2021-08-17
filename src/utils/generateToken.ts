import jwt, { Secret } from "jsonwebtoken";

import { GeneratedTokenInterface } from "#root/interfaces/generatedToken";
import { environmentVariables } from "./env";

const JWT_SECRET: Secret = environmentVariables.JWT_SECRET || "dev_jwt_secret";
const REFRESH_JWT_SECRET: Secret = environmentVariables.REFRESH_JWT_SECRET || "dev_refresh_jwt_secret";

type TokenTypes = "ACCESS_TOKEN" | "REFRESH_TOKEN";

export const generateToken = (type: TokenTypes, { id, email }: GeneratedTokenInterface, mins: number) => {
	let jwtPayload: GeneratedTokenInterface = { id };
	const secret = type === "REFRESH_TOKEN" ? REFRESH_JWT_SECRET : JWT_SECRET;

	if (email) jwtPayload = { ...jwtPayload, email };

	return jwt.sign({ ...jwtPayload }, secret, {
		expiresIn: `${mins}m`,
	});
};

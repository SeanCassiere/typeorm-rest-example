import { redis } from "../redis";
import { v4 } from "uuid";

import { forgotPasswordPrefix } from "./constants/redisPrefixes";

export const createResetPasswordURL = async (userId: number) => {
	const token = v4();
	await redis.set(forgotPasswordPrefix + token, userId, "ex", 60 * 60 * 2); //Expire in 2 hours

	return `http://localhost:3000/user/forgot-password/${token}`;
};

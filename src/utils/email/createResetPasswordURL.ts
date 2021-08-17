import { v4 } from "uuid";

import { redis } from "#root/redis";
import { forgotPasswordPrefix } from "#root/utils/constants/redisPrefixes";
import { environmentVariables } from "#root/utils/env";

export const createResetPasswordURL = async (userId: number) => {
	const token = v4();
	await redis.set(forgotPasswordPrefix + token, userId, "ex", 60 * 60 * 2); //Expire in 2 hours

	return `${environmentVariables.FRONTEND_HOST as string}/user/forgot-password/${token}`;
};

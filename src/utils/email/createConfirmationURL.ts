import { v4 } from "uuid";

import { redis } from "#root/redis";
import { confirmationEmailPrefix } from "#root/utils/constants/redisPrefixes";
import { environmentVariables } from "#root/utils/env";

export const createConfirmationUrl = async (userId: number) => {
	const token = v4();
	await redis.set(confirmationEmailPrefix + token, userId, "ex", 60 * 60 * 24); //Expire in 1 day

	return `${environmentVariables.FRONTEND_HOST as string}/user/confirm/${token}`;
};

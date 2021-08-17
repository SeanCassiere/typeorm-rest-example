import { redis } from "../../redis";
import { v4 } from "uuid";

import { changeEmailPrefix } from "../constants/redisPrefixes";
import { generateToken } from "../generateToken";
import { environmentVariables } from "../env";

export const createChangeEmailUrl = async ({ id, email }: { id: string; email: string }) => {
	const token = v4();
	const jwt = generateToken("ACCESS_TOKEN", { id, email }, 60 * 24); //Expire in 1 day
	await redis.set(changeEmailPrefix + token, jwt, "ex", 60 * 60 * 24); //Expire in 1 day

	return `${environmentVariables.FRONTEND_HOST as string}/user/changeEmail/${token}`;
};

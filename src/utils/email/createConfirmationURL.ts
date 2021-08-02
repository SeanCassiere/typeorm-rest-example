import { redis } from "../../redis";
import { v4 } from "uuid";

import { confirmationEmailPrefix } from "../constants/redisPrefixes";

export const createConfirmationUrl = async (userId: number) => {
	const token = v4();
	await redis.set(confirmationEmailPrefix + token, userId, "ex", 60 * 60 * 24); //Expire in 1 day

	return `${process.env.FRONTEND_HOST as string}/user/confirm/${token}`;
};
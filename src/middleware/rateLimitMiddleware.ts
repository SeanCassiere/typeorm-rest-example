import rateLimit from "express-rate-limit";

import { environmentVariables } from "../utils/env";

export const blanketApiRateLimiter = rateLimit({
	windowMs: environmentVariables.NODE_ENV === "production" ? 10 * 60 * 1000 : 1 * 60 * 1000, // 10 minutes
	max: 100, // 100 requests
});

export const registerRouteRateLimiter = rateLimit({
	windowMs: environmentVariables.NODE_ENV === "production" ? 30 * 60 * 1000 : 1 * 60 * 1000, // 30 minutes
	max: 5, // 5 requests
});

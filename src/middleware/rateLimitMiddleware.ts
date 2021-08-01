import rateLimit from "express-rate-limit";

export const blanketApiRateLimiter = rateLimit({
	windowMs: process.env.NODE_ENV === "production" ? 10 * 60 * 1000 : 1 * 60 * 1000, // 10 minutes
	max: 100, // 100 requests
});

export const registerRouteRateLimiter = rateLimit({
	windowMs: process.env.NODE_ENV === "production" ? 30 * 60 * 1000 : 1 * 60 * 1000, // 30 minutes
	max: 5, // 5 requests
});

import "reflect-metadata";
import dotenv from "dotenv";
import Express from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";

import { errorHandler, notFound } from "./middleware/errorMiddleware";
import { blanketApiRateLimiter } from "./middleware/rateLimitMiddleware";
import swaggerDocument from "./swagger.json";
import { createTypeormConn } from "./utils/createTypeOrmConn";

import { userRouter } from "./routes/userRoutes";

dotenv.config();

const PORT = process.env.PORT ? process.env.PORT : 4000;
const COOKIE_SECRET = process.env.COOKIE_SECRET ? process.env.COOKIE_SECRET : "cookie_secret";

const main = async () => {
	try {
		await createTypeormConn();

		const app = Express();

		app.use(cors());
		app.use(helmet());
		app.use(morgan("dev"));
		app.use(cookieParser(COOKIE_SECRET));
		app.use(Express.json());

		app.get("/", (_, res) => {
			res.send("hello world");
		});
		app.use("/docs", swaggerUI.serve);
		app.get("/docs", swaggerUI.setup(swaggerDocument));

		app.use("/api", blanketApiRateLimiter);
		//** Implement API Routes*/
		app.use("/api/users", userRouter);

		app.use(notFound);
		app.use(errorHandler);

		app.listen(PORT, () => {
			console.log(`Server running on Port ${PORT}`);
		});
	} catch (error) {
		console.log(`DB connection error\n${error}`);
	}
};

main();

import "reflect-metadata";
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
import { environmentVariables } from "./utils/env";

import { userRouter } from "./routes/userRoutes";

const PORT = environmentVariables.PORT ? environmentVariables.PORT : 4000;
const COOKIE_SECRET = environmentVariables.COOKIE_SECRET ? environmentVariables.COOKIE_SECRET : "cookie_secret";

const main = async () => {
	try {
		await createTypeormConn();

		const app = Express();

		app.use(cors({ origin: (_, cb) => cb(null, true), credentials: true }));
		app.use(helmet());
		app.use(morgan(environmentVariables.NODE_ENV === "production" ? "tiny" : "dev"));
		app.use(cookieParser(COOKIE_SECRET));
		app.use(Express.json());

		app.get("/", (_, res) => {
			res.redirect("/docs");
		});

		app.get("/docs/swagger.json", (_, res) => {
			res.status(200).send(swaggerDocument);
		});

		app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

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

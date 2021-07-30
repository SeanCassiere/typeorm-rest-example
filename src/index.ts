import "reflect-metadata";
import dotenv from "dotenv";
import Express from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import swaggerUI from "swagger-ui-express";

import { errorHandler, notFound } from "./middleware/errorMiddleware";
import swaggerDocument from "./swagger.json";

import { userRouter } from "./routes/userRoutes";

dotenv.config();

const PORT = process.env.PORT ?? 4000;

createConnection()
	.then(() => {
		const app = Express();

		app.use(cors());
		app.use(Express.json());

		app.get("/", (_, res) => {
			res.send("hello world");
		});
		app.use("/docs", swaggerUI.serve);
		app.get("/docs", swaggerUI.setup(swaggerDocument));

		//** Implement API Routes*/
		app.use("/api/users", userRouter);

		app.use(notFound);
		app.use(errorHandler);

		app.listen(PORT, () => {
			console.log(`Server running on Port ${PORT}`);
		});
	})
	.catch((err) => console.log(`DB connection error\n${err}`));

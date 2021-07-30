import "reflect-metadata";
import dotenv from "dotenv";
import Express from "express";
import cors from "cors";
import swaggerUI from "swagger-ui-express";

import { errorHandler, notFound } from "./middleware/errorMiddleware";
import swaggerDocument from "./swagger.json";
import { createTypeormConn } from "./utils/createTypeOrmConn";

import { userRouter } from "./routes/userRoutes";

dotenv.config();

const PORT = process.env.PORT ?? 4000;

const main = async () => {
	try {
		await createTypeormConn();

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
	} catch (error) {
		console.log(`DB connection error\n${error}`);
	}
};

main();

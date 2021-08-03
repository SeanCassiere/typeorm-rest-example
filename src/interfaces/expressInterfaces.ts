import { Request } from "express";
import { User } from "../entities/User";

export interface CustomRequest<T> extends Request {
	body: T;
	user?: User;
	swaggerDoc?: any;
}

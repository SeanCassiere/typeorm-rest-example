import { Request } from "express";
import { User } from "#root/entities/User";

export interface CustomRequest<T> extends Request {
	body: T;
	user?: User;
	swaggerDoc?: any;
}

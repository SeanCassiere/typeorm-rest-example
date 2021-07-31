import * as Yup from "yup";

export const userLoginBodySchema = Yup.object().shape({
	email: Yup.string().email().required(),
	password: Yup.string().min(3).required(),
});

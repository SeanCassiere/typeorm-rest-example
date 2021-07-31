import * as Yup from "yup";

const email = Yup.string().email().required();
const password = Yup.string().min(3).required();
const firstName = Yup.string().min(3).required();
const lastName = Yup.string().min(3).required();

export const userLoginBodySchema = Yup.object().shape({
	email,
	password,
});

export const confirmUserBodySchema = Yup.object().shape({ token: Yup.string().required() });

export const registerUserBodySchema = Yup.object().shape({
	firstName,
	lastName,
	email,
	password,
});

export const selfUserUpdateBodySchema = Yup.object().shape({
	firstName: Yup.string().min(3),
	lastName: Yup.string().min(3),
	email: Yup.string().email(),
	password: Yup.string().min(3),
});

export const adminUserUpdateBodySchema = Yup.object().shape({
	firstName: Yup.string().min(3),
	lastName: Yup.string().min(3),
	email: Yup.string().email(),
	isEmailConfirmed: Yup.boolean(),
	isAdmin: Yup.boolean(),
	isActive: Yup.boolean(),
});

export const resendConfirmationSchema = Yup.object().shape({ email });

export const resetPasswordWithTokenSchema = Yup.object().shape({
	token: Yup.string().required(),
	password,
});

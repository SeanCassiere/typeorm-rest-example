import bcryptjs from "bcryptjs";

export const hashPasswordForUser = async (password: string) => {
	const hashedPassword = await bcryptjs.hash(password, 12);
	return hashedPassword;
};

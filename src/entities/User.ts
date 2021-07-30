import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column("text", { unique: true })
	email: string;

	@Column()
	password: string;

	@Column("bool", { default: true, name: "is_active" })
	isActive: boolean;

	@Column("bool", { default: false, name: "is_email_confirmed" })
	isEmailConfirmed: boolean;

	@Column("bool", { default: false, name: "is_admin" })
	isAdmin: boolean;
}

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

	@Column("bool", { default: true })
	isActive: boolean;

	@Column("bool", { default: false })
	isEmailConfirmed: boolean;

	@Column("bool", { default: false })
	isAdmin: boolean;
}

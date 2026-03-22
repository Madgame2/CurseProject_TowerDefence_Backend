import { IsEmail, IsString, Length } from "class-validator";


export class RegisterUserDTO {
    @IsString()
    @Length(3, 20)
    nickname!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @Length(6, 50)
    password!: string;
}
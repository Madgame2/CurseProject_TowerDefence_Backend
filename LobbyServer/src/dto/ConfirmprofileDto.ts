import { IsEmail, IsString, Length } from "class-validator";


export class ConfirmProfileDTO {
    @IsEmail()
    email!: string;

    @IsString()
    code!: string;
}
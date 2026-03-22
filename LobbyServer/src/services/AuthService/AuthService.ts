import { RegisterUserDTO } from "../../dto/RegisterUserDTO";
import { ConfirmProfileDTO } from "../../dto/ConfirmprofileDto";
import { RegistrationTempService } from "./registration-temp.service";
import bcrypt from "bcrypt";
import { EmailService } from "../EmailService/Email.service";
import { UnitOfWork } from "../UnitOfWork/UnitOfWork";
import { CONFIG } from "../../config/config";
import prisma from "../../config/prisma.config";
import { debug } from "node:console";


export class AuthService {
    
    private _registrationTempService = new RegistrationTempService();
    private emailService = new EmailService();
    private uow = new UnitOfWork();

    private async saveCode(dto: RegisterUserDTO): Promise<string> {
        const code = this.generateCode();

        await this._registrationTempService.save({
            email: dto.email,
            code,
            dto
        })

        return code;
    }

    private generateCode(): string{
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async findUserByEmail(email: string) {
        await this.uow.start(); // обязательно
        const player = await this.uow.players.findByEmail(email);
        await this.uow.commit(); // или rollback при ошибке
        return player;
    }

    public startRegister = async (dto: RegisterUserDTO) => {
        try {
            const existingUser = await this.findUserByEmail(dto.email);
            if (existingUser) {
                return { success: false, code: 409, message: "Пользователь с таким email уже существует" };
            }

            const existUnconfirmuser = await this._registrationTempService.get(dto.email);
            if(existUnconfirmuser){
                  return {
                    statusCode: 409,
                    success: false,
                    message: "Вы уже начали регистрацию. Пожалуйста, подтвердите существующий код."
                };
            }

            const hashPassword = await bcrypt.hash(dto.password, 10);
            dto.password = hashPassword;

            const code: string = await this.saveCode(dto);

            await this.emailService.sendVerificationCode(dto.email, code);

            return { success: true };
        } catch (error) {
            this._registrationTempService.delete(dto.email);
            throw error;
        }
    };

    public confirmprofile = async (dto: ConfirmProfileDTO) =>{
            const existUnconfirmuser = await this._registrationTempService.get(dto.email);

            console.log(existUnconfirmuser);
            if(!existUnconfirmuser){
                  return {
                    code: 404,
                    success: false,
                };
            }

            if(existUnconfirmuser.code != dto.code){
                return {
                    code: 400,
                    success: false
                }
            }

                console.log(dto.code);
                console.log(existUnconfirmuser.code);

            try {
                await this.uow.start(); // Ждём создания транзакции и репозиториев
                await this.uow.players.Create(existUnconfirmuser.dto); // Ждём создания игрока
                await this._registrationTempService.delete(dto.email);
                await this.uow.commit(); // Ждём commit

                return {success: true}
            } catch(error) {
                await this.uow.rollback(); // Ждём rollback
                throw error;
            }
    }
}
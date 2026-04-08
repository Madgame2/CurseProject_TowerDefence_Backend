import { RegisterUserDTO } from "../../dto/RegisterUserDTO";
import { ConfirmProfileDTO } from "../../dto/ConfirmprofileDto";
import { RegistrationTempService } from "./registration-temp.service";
import bcrypt from "bcrypt";
import { EmailService } from "../EmailService/Email.service";
import { UnitOfWork } from "../UnitOfWork/UnitOfWork";
import { AuthorizationDto } from "../../dto/AuthorizationDto";
import { Player } from "../../models/player.entity";
import crypto from "crypto";
import { redis } from "../../config/redis.config";
import jwt, { SignOptions } from "jsonwebtoken";



export class AuthService {
    
    private _registrationTempService = new RegistrationTempService();
    private emailService = new EmailService();
    private uow = new UnitOfWork(redis);

    private async saveCode(dto: RegisterUserDTO): Promise<string> {
        const code = this.generateCode();

        await this._registrationTempService.save({
            email: dto.email,
            code,
            dto
        })

        return code;
    }

    public deleteUnconfirmedUser = async (email :string)=>{
        const existUnconfirmuser = await this._registrationTempService.get(email);

        console.log(existUnconfirmuser);
        if(!existUnconfirmuser){
                  return {
                    code: 404,
                    success: false,
            };
        }

        await this._registrationTempService.delete(email);

        return {success: true}
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

    private getHashpassword = async (password:string)=>{
        return await bcrypt.hash(password, 10);
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

            const hashPassword = await this.getHashpassword(dto.password);
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

    private processUserAuthorization= async (player: Player)=>{
        const sessionId = crypto.randomUUID();

        await redis.set(
            `session:${sessionId}`,
            JSON.stringify({
                userId: player.id
            }),
            "EX",
            60 * 60 * 24 * 7 // 7 дней
        );


        const payload = {
            userId: player.id,
            sessionId
        };

        // Берем TTL из env, если нет — ставим дефолт "15m"
        const ttl = process.env.JWT_TTL ?? "15m"; // оператор nullish coalescing гарантирует, что не undefined

        const options = {
            expiresIn: ttl as "15m" | "30m" | "1h" | "2h" | "1d" // или оставь как string, если уверен в значении
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, options);


        const refreshToken = crypto.randomUUID();

        await redis.set(
            `refresh:${refreshToken}`,
                JSON.stringify({
                    userId: player.id
                }),
            "EX",
            60 * 60 * 24 * 30 // 30 дней
        );

        return {
            accessToken,
            refreshToken
        };
    }

    public tryAuthUser = async(dto:AuthorizationDto) =>{

        await this.uow.start();
        const user = await this.uow.players.findByEmail(dto.email);
        await this.uow.commit();

        console.log(dto);

        if(!user){
            return {success: false, code: 404}
        }

        const isValid = await bcrypt.compare(dto.password, user.password);

        if (!isValid) {
            return { success: false, code: 403 };
        }

        const tokens = await this.processUserAuthorization(user);

        return {
            success: true,
            ...tokens
        };
    }
}
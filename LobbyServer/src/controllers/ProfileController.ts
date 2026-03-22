import { RegisterUserDTO } from "../dto/RegisterUserDTO";
import { UnitOfWork } from "../services/UnitOfWork/UnitOfWork";
import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AuthService } from "../services/AuthService/AuthService";
import { ConfirmProfileDTO } from "../dto/ConfirmprofileDto";

    class ProfileController{

        private authService = new AuthService();

        public register = async (req:Request, res:Response)=>{
            try{
                const dto = plainToInstance(RegisterUserDTO, req.body);
                const errors = await validate(dto);

                if (errors.length > 0) {
                    return res.status(400).json({ success: false,message: "В котроллере" ,errors });
                }

                const result = await this.authService.startRegister(dto);

                if (!result.success) {
                    
                    return res.status(result.code || 400).json({
                        success: false,
                        message: result.message || "Ошибка при регистрации"
                    });
                }
                
                res.status(200).json({
                    success: true,
                    message: "Пользователь создан. Проверьте почту для подтверждения кода."
                });
            }catch (error:any){
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: "Ошибка при регистрации: " + error.message
                });
            }
        }

        public confirmRegister = async(req: Request, res: Response) =>{

            try{
                const dto = plainToInstance(ConfirmProfileDTO, req.body);
                const errors = await validate(dto);

                if (errors.length > 0) {
                    return res.status(400).json({ success: false, errors });
                }

                const result = await this.authService.confirmprofile(dto);

                if(!result?.success){
                    return res.status(result?.code || 400).json({
                        success: false
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Пользователь создан."
                });
            }catch (error:any){
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: "Ошибка при регистрации: " + error.message
                });
            }
        }
    }

export default new ProfileController();
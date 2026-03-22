import { emailConfig } from "../../config/mail.config"
import nodemailer from "nodemailer"
import { commonConfig } from "../../config/common.config";

export class EmailService{

    private transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            service: emailConfig.service,
            auth:{
                user: emailConfig.user,
                pass: emailConfig.password
            }
        })
    }

    public sendVerificationCode = async (email: string, code:string)=>{
        try{
            const info = await this.transporter.sendMail({
                from: `${commonConfig.name} <${emailConfig.user}>`,
                to: email,
                subject: "confirmation code",
                text: `your confirmation code: ${code}`,
                html: `<b>your confirmation code: ${code}</b>`
            })

            return true;
        }catch(err){
            console.error("Error sending email:", err);
            throw err;
        }
    }
}
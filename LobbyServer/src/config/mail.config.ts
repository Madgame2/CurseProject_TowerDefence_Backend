import dotenv from "dotenv";


dotenv.config();

export const emailConfig ={
    service: process.env.MAILSERVICE || "gmail",
    user: process.env.MAIL_USER || "mailUser",
    password: process.env.MAIL_PASSWORD || "mailpass"
}
import { Sequelize } from "sequelize";
import dotenv from "dotenv"

dotenv.config();

if(!process.env.DB_NAME){
    throw Error("not define DB_NAME");
}



export const sequelize = new Sequelize (
    process.env.DB_NAME || "master",
    process.env.DB_USER || "sa",
    process.env.DB_PASSWORD || "password",
    {
        host : process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 1433,
        dialect: "mssql",
        logging: false,
            dialectOptions: {
            options: {
                encrypt: false,
                trustServerCertificate: true,
            },
        }
    }
)
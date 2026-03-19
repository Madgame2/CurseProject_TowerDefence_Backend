import dotenv from "dotenv"

dotenv.config();

export const SERVER_CONFIG ={
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
    maxConnected: Number(process.env.MAX_CONNECTED) || 50,
}
import dotenv from "dotenv";

dotenv.config();

export const commonConfig ={
    name: process.env.GAME_NAME
}
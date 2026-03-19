import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Player } from "../models/player.entity";

dotenv.config();

export const DB_CONFIG = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 1433,
    username: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "YourPassword",
    database: process.env.DB_NAME || "TowerDefenceDB",
    synchronize: true,
    logging: false,
    entities: [Player]
})
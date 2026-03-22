import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Загружаем .env
dotenv.config();

// Проверка, что DATABASE_URL задана
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL не задана в .env");
}

// PrismaClient автоматически подхватит DATABASE_URL
const prisma = new PrismaClient();

export default prisma;
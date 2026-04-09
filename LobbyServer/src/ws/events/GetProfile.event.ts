import { WSContext } from "../types/WSContext";
import { sequelize } from "../../config/DB.config";
import { redis } from "../../config/redis.config";
import { Player } from "../../models/player.entity";
import { WSResponse } from "../../types/WSResponse";

export const GetProfile = async (ctx: WSContext) => {
    const userId = ctx.userId;
    const cacheKey = `profile:${userId}`;

    try {
        // 1. Redis
        const cachedProfile = await redis.get(cacheKey);

        if (cachedProfile) {
            const response: WSResponse = {
                code: 200,
                requestId: ctx.requestId,
                data: JSON.parse(cachedProfile) // ✅ фикс
            };

            ctx.ws.send(JSON.stringify(response));
            return;
        }

        // 2. DB
        const profile = await Player.findByPk(userId);

        if (!profile) {
            ctx.ws.send(JSON.stringify({
                code: 404,
                message: "Profile not found",
                requestId: ctx.requestId
            }));
            return;
        }

        // ✅ нормальная сериализация
        const plainProfile = profile.toJSON();

        // 3. Cache
        await redis.set(
            cacheKey,
            JSON.stringify(plainProfile),
            "EX",
            600
        );

        // 4. Response
        ctx.ws.send(JSON.stringify({
            code: 200,
            data: plainProfile,
            requestId: ctx.requestId
        }));

    } catch (error) {
        console.error("GetProfile error:", error);

        ctx.ws.send(JSON.stringify({
            code: 500,
            message: "Internal server error",
            requestId: ctx.requestId
        }));
    }
};
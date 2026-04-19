import { WSContext } from "../types/WSContext";
import { redis } from "../../config/redis.config";
import { RedisScripts } from "../../redis/scriptsLoader";

export const userState = async (ctx: WSContext, next: (err?: any) => void) => {
    
    ctx.userState = await redis.evalsha(
        RedisScripts.GetuserStateSha,
        1,
        `user:${ctx.userId}:state`,
        "IN_LOBBY"
    ) as string

    return next();
};
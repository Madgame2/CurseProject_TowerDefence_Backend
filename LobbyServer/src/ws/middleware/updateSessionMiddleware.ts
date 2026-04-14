import { redis } from "../../config/redis.config";
import { WSContext } from "../types/WSContext";

/**
 * Фабрика middleware, которая возвращает функцию для socket.use
 * @param socket сокет, из которого можно взять sessionId
 */
export const UpdateSession = async(ctx: WSContext, next:(err?: any) => void) => {
        try {
            const sessionId = ctx.sessionId; 

            if(ctx.message?.action == 'ping'){
                return next();
            }
            console.log(sessionId);
            if (sessionId) {
                await redis.expire(`session:${sessionId}`, 60 * 60 * 24 * 7); // продлеваем TTL на 7 дней
                console.log(`Session ${sessionId} TTL updated`);
            } else {
                console.warn("No sessionId found in socket.data, TTL not updated");
            }

            next();
        } catch (err) {
            console.error("Error updating session:", err);
            next(err);
        }
    };
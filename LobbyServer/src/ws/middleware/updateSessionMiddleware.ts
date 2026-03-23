import { Socket } from "socket.io";
import { redis } from "../../config/redis.config";

/**
 * Фабрика middleware, которая возвращает функцию для socket.use
 * @param socket сокет, из которого можно взять sessionId
 */
export const createUpdateSessionMiddleware = (socket: Socket) => {
    return async (packet: any[], next: (err?: any) => void) => {
        try {
            const sessionId = socket.data.sessionId; // берем sessionId из socket.data

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
};
import { WSContext } from "../types/WSContext";
import { sessionBuffer } from "../modules/SessionsBuffer";
import { WSResponse } from "../../types/WSResponse";
import { redis } from "../../config/redis.config";

const pendingLoads = new Map<string, Promise<{ userId: string } | null>>();

export const isValidSession = async (ctx: WSContext, next: (err?: any) => void) => {
    
    const sessionId = ctx.sessionId!;
    
    // Ищем сессию в буфере
    let session = sessionBuffer.getSession(sessionId);

    // Если нет в буфере, ищем в Redis
    if (!session) {
        const redisSession = await getRedisSession(sessionId);
        if (!redisSession) {
            ctx.ws.send(JSON.stringify({ code: 401, message: "session expired" }));
            ctx.ws.close();
            return;
        }

        // Добавляем в буфер с TTL 1 день
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        sessionBuffer.addSession(sessionId, redisSession.userId, ONE_DAY_MS);

        // Теперь session берём из Redis
        session = { userId: redisSession.userId, expiresAt: Date.now() + ONE_DAY_MS };
    }

    if (ctx.userId !== session.userId) {
        const response: WSResponse = { code: 403, message: "invalid session or userId" };
        ctx.ws.send(JSON.stringify(response));
        ctx.ws.close();
        return;
    }


    return next();
};

const getRedisSession = async (sessionId: string): Promise<{ userId: string } | null> => {

    if (pendingLoads.has(sessionId)) {
        return pendingLoads.get(sessionId)!;
    }

    const promise = (async ()=>{
        const redisData = await redis.get(`session:${sessionId}`);
        if (!redisData) return null;

        try {
            return JSON.parse(redisData);
        } catch (err) {
            console.error("Redis session parse error", err);
            return null;
        }
    })();

    pendingLoads.set(sessionId, promise);

    try {
        return await promise;
    } finally {
        pendingLoads.delete(sessionId);
    }
}
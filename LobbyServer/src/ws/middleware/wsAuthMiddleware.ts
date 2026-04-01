import { Socket } from "socket.io"
import { redis } from "../../config/redis.config";
import  jwt   from "jsonwebtoken";
import dotenv from "dotenv";
import { WSResponse } from "../../types/WSResponse";
import { MyJWTPayload } from "../../types/MyJWTPayload";

import { WSError } from "../../types/WSError";
import { WSContext } from "../types/WSContext";

dotenv.config();

export const wsAuth = async (ctx: WSContext, next:(err?: any) => void) => {
    try {
        const url = new URL(ctx.req.url || "", "http://localhost");
        const token = url.searchParams.get("token");

        if (!token) {
            const errResponse: WSResponse = { code: 404, message: "No token" };
            ctx.ws.send(JSON.stringify(errResponse));
            ctx.ws.close();
            return;
        }

        let payload: MyJWTPayload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET!) as MyJWTPayload;
        } catch (jwtErr) {
            const errResponse: WSResponse = { code: 401, message: "Invalid token" };
            ctx.ws.send(JSON.stringify(errResponse));
            ctx.ws.close();
            return;
        }

        const redisRecord = await redis.get(`session:${payload.sessionId}`);
        if (!redisRecord) {
            const errResponse: WSResponse = { code: 401, message: "Session expired" };
            ctx.ws.send(JSON.stringify(errResponse));
            ctx.ws.close();
            return;
        }

        const session = JSON.parse(redisRecord);
        ctx.userId = session.userId;
        ctx.sessionId = payload.sessionId;

        next();
    }
    catch (err: any) {
        if (err instanceof WSError) {
            next(err);
        } else {
            next(new WSError(500, err.message || "Unauthorized"));
        }
    }
};
import { Socket } from "socket.io"
import { redis } from "../../config/redis.config";
import  jwt   from "jsonwebtoken";
import dotenv from "dotenv";
import { WSResponse } from "../../types/WSResponse";
import { MyJWTPayload } from "../../types/MyJWTPayload";

import { WSError } from "../../types/WSError";

dotenv.config();

export const wsAuth = async (socket: Socket, next: (err?: any) => void) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            const errResponse: WSResponse = { code: 404, message: "No token" };
            throw new Error(JSON.stringify(errResponse));
        }

        let payload: MyJWTPayload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET!) as MyJWTPayload;
        } catch (jwtErr) {
            const errResponse: WSResponse = { code: 401, message: "Invalid token" };
            throw new Error(JSON.stringify(errResponse));
        }

        const redisRecord = await redis.get(`session:${payload.sessionId}`);
        if (!redisRecord) {
            const errResponse: WSResponse = { code: 401, message: "Session expired" };
            throw new Error(JSON.stringify(errResponse));
        }

        const session = JSON.parse(redisRecord);
        socket.data.userId = session.userId;
        socket.data.sessionId = payload.sessionId;

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
import { WSContext } from "../types/WSContext"
import { WSResponse } from "../../types/WSResponse";

export const parseMessage = async (ctx: WSContext, next: (err?: any) => void) => {
    try {
        const parsed = JSON.parse(ctx.rawMessage!);
        console.log(ctx);
        // 👇 базовая валидация
        if (!parsed.action || typeof parsed.action !== "string") {
            throw new Error("Invalid action");
        }

        ctx.message = {
            action: parsed.action,
            payload: parsed.payload,
            requestId: parsed.requestId
        };

        ctx.requestId = parsed.requestId; 

        await next();

    } catch (e) {
        const errResponse: WSResponse = {
            requestId: ctx.requestId, 
            code: 400,
            message: "Invalid message format"
        };

        ctx.ws.send(JSON.stringify(errResponse));
    }
};
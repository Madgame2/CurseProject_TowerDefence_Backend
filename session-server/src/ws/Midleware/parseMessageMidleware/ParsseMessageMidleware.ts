import { Injectable } from "@nestjs/common";
import { WSContext } from "src/ws/Types/WsContext";
import { ConnectionMiddleware } from "src/ws/Types/WsContext";
import { WSResponse } from "src/ws/Types/WSResponse";


@Injectable()
export class parseMessageMiddleware implements ConnectionMiddleware{
 
    async handle(ctx: WSContext, next: () => Promise<void>) {
    try {
        const parsed = JSON.parse(ctx.rawMessage!);
        // базовая валидация
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

        console.log("INVALID MESSAGE FORMAT");
        ctx.ws.send(JSON.stringify(errResponse));
    }
    }
}
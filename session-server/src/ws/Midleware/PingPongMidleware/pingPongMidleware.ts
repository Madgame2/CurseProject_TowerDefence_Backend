import { Injectable } from "@nestjs/common"
import { ConnectionMiddleware } from "src/ws/Types/WsContext"
import { WSContext } from "src/ws/Types/WsContext"
import { WSResponse } from "src/ws/Types/WSResponse";


@Injectable()
export class PingPongMiddleware implements ConnectionMiddleware{
 
    async handle(ctx: WSContext, next: () => Promise<void>) {

        if(ctx.message?.action =="ping"){
            const res : WSResponse = {action: "pong", code:200};
            console.log(ctx.message);
            console.log(res);
            ctx.ws.send(JSON.stringify(res));
        }

        await next()
    }
}
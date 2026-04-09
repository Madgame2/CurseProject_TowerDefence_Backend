import { WSContext } from "../types/WSContext"
import { WSResponse } from "../../types/WSResponse";

export class WSRouter {
    private handlers = new Map<string, (ctx:WSContext) => Promise<void>>();

    on(action: string, handler:(ctx:WSContext)=>Promise<void>){
        this.handlers.set(action, handler);
    }

    async handle(ctx: WSContext){
        const action = ctx.message?.action;

        const handler = this.handlers.get(action!);

        if(!handler){
            const responce: WSResponse = {code: 405, message:"wrong action"}
            ctx.ws.send(JSON.stringify(responce));
            return;
        }

        await handler(ctx);
    }
}
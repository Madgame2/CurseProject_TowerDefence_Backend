import { Injectable } from "@nestjs/common";
import { WSContext } from "src/ws/Types/WsContext";
import { ConnectionMiddleware } from "src/ws/Types/WsContext";
import { SessionRegistry } from "src/sessions/SessionRegistryModule/SessionRegistry";
import { SesionManager } from "src/sessions/sessionManager/sessionManager";


@Injectable()
export class DisconnectMidleware implements ConnectionMiddleware{

    constructor(private readonly sessionManager:SesionManager){}

    async handle(ctx: WSContext, next: () => Promise<void>) {
        this.sessionManager.removeClient(ctx.sessionId!, ctx.userId!)
        await next();
    }
}
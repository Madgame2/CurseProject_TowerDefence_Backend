import { Injectable } from "@nestjs/common"
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { ConnectionMiddleware } from "src/ws/Types/WsContext"
import { WSContext } from "src/ws/Types/WsContext"
import { WSResponse } from "src/ws/Types/WSResponse";


@Injectable()
export class WsmessageRouterMiddleware implements ConnectionMiddleware{
    
    constructor(private registry: ClientRegistryService){}

    async handle(ctx: WSContext, next: () => Promise<void>) {
        const connection = this.registry.getClient(ctx.userId!);
        connection?.router.handleMessage(ctx);

        await next()
    }
}
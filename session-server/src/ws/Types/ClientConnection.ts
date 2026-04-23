import { WSContext } from "./WsContext";
import { WsMessageRouter } from "../MessageRouter/WsMessageRouter";

export class ClientConnection {
    ctx: WSContext;
    router: WsMessageRouter;

    constructor(ctx: WSContext) {
        this.ctx = ctx;
        this.router = new WsMessageRouter(ctx.ws);
    }
}
import { WSContext } from "./WsContext";
import { WsMessageRouter } from "../MessageRouter/WsMessageRouter";
import { Session } from "src/types/session";

export class ClientConnection {
    ctx: WSContext;
    public session!: Session;
    router: WsMessageRouter;

    constructor(ctx: WSContext, session: Session) {
        this.ctx = ctx;
        this.session = session;
        this.router = new WsMessageRouter(ctx.ws);
    }
}
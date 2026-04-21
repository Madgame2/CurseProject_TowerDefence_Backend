import { Injectable } from "@nestjs/common";
import { SesionManager } from "src/sessions/sessionManager/sessionManager";
import { SessionRegistry } from "src/sessions/SessionRegistryModule/SessionRegistry";
import { ConnectionMiddleware } from "src/ws/Types/WsContext";
import { WSContext } from "src/ws/Types/WsContext";
import { WSResponse } from "src/ws/Types/WSResponse";

@Injectable()
export class ConnectionAuthMiddleware implements ConnectionMiddleware {

    constructor(private readonly sessionRegistry: SessionRegistry, private readonly sessionManager:SesionManager){}

async handle(ctx: WSContext, next: () => Promise<void>) {
    const auth = ctx.req.headers['authorization'] as string | undefined;
    const userId = ctx.req.headers['x-user-id'] as string | undefined;
    const sessionId = ctx.req.headers['x-session-id'] as string | undefined;

    console.log(auth, userId, sessionId);

    const reject = (msg: string) => {
        ctx.ws.send(msg);
        ctx.ws.close();
    };

    if (!auth || !userId || !sessionId) {
        const res: WSResponse = {code:403, message: "Missing auth headers"};
        ctx.ws.send(res);
        return ctx.ws.close();
    }

    const session = this.sessionRegistry.get(sessionId);

    if (!session) {
        return reject("Session not found");
    }


    if (session.PassToken !== auth) {
        return reject("Invalid session token");
    }

    const players = session.Players ?? [];

    const findUser = players.has(userId);

    if (!findUser) {
        return reject("User not in session");
    }

    ctx.userId = userId;
    ctx.sessionId = sessionId;
    this.sessionManager.addPlayer(ctx.sessionId, ctx.userId);

    await next();
}
}
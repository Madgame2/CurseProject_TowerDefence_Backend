import { Injectable } from "@nestjs/common";
import { SessionRegistry } from "src/sessions/SessionRegistryModule/SessionRegistry";
import { ConnectionMiddleware } from "src/ws/Types/WsContext";
import { WSContext } from "src/ws/Types/WsContext";

@Injectable()
export class ConnectionAuthMiddleware implements ConnectionMiddleware {

    constructor(private readonly sessionRegistry: SessionRegistry){}

async handle(ctx: WSContext, next: () => Promise<void>) {
    const auth = ctx.req.headers['authorization'] as string | undefined;
    const userId = ctx.req.headers['x-user-id'] as string | undefined;
    const sessionId = ctx.req.headers['x-session-id'] as string | undefined;

    const reject = (msg: string) => {
        ctx.ws.send(msg);
        ctx.ws.close();
    };

    if (!auth || !userId || !sessionId) {
        return reject("Missing auth headers");
    }

    const session = this.sessionRegistry.get(sessionId);

    if (!session) {
        return reject("Session not found");
    }


    if (session.PassToken !== auth) {
        return reject("Invalid session token");
    }

    const players = session.Players ?? [];

    const findUser = players.includes(userId);

    if (!findUser) {
        return reject("User not in session");
    }

    ctx.userId = userId;
    ctx.sessionId = sessionId;

    await next();
}
}
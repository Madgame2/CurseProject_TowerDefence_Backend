import { WebSocketServer, WebSocket } from "ws";
import { runMiddlewares } from "./MiddlewareModule/runMiddlewares";
import { wsAuth } from "./middleware/wsAuthMiddleware";
import { isValidSession } from "./middleware/isValidSession";
import { parseMessage } from "./middleware/parseMessageMiddleware";
import { UpdateSession } from "./middleware/updateSessionMiddleware";
import { removeUserFromAllNotifiers } from "./Services/NotifySustem/NotifySystem";
import lobbyService from "./Services/LobbyService/Lobby.Service";
import WSrouter from "./Router/WSRouter";
import { ClientManager } from "./modules/ClientManager";
import { WSContext } from "./types/WSContext";
import { userState } from "./middleware/userStateMiddleware";
import { redis } from "../config/redis.config";
import { RedisScripts } from "../redis/scriptsLoader";

export function setupWebSocket(server: any) {
    const wss = new WebSocketServer({ server });
    const clientManager = ClientManager.getInstance();

    wss.on("connection", async (ws: WebSocket, req) => {
        const ctx: WSContext = { ws, req };

        await runMiddlewares(ctx, [wsAuth,
            userState
        ]);

        console.log("User connected:", ctx.userId);

        (ws as any).userId = ctx.userId;
        await clientManager.addClient(ctx);

        ws.on("message", async (data) => {
            ctx.rawMessage = data.toString();

            await runMiddlewares(ctx, [
                isValidSession,
                parseMessage,
                UpdateSession
            ]);

            WSrouter.handle(ctx);
        });

        ws.on("close", async () => {
            const userId = (ws as any).userId;
            if (!userId) return;

            await clientManager.removeClient(userId);
            removeUserFromAllNotifiers(userId);

            console.log("DISCONNECT:", userId);

            await lobbyService.onDisconnect(userId);

            await redis.evalsha(
                RedisScripts.deleteuserSha,
                2,
                `user:${userId}:state`,
                `user:${userId}:server`,
                userId,
                "IN_LOBBY"
            )
        });

        ws.on("error", () => {});

        ws.send(JSON.stringify({
            code: 200,
            message: "Connected"
        }));
    });

    return wss;
}
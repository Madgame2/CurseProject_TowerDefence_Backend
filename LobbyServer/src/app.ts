import express from "express";
import router from "./routes/Routes";
import { Server } from "socket.io";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { wsAuth } from "./ws/middleware/wsAuthMiddleware";
import { UpdateSession } from "./ws/middleware/updateSessionMiddleware";
import { WSContext } from "./ws/types/WSContext";
import { runMiddlewares } from "./ws/MiddlewareModule/runMiddlewares";
import { WSResponse } from "./types/WSResponse";
import { WSRouter } from "./ws/modules/WSRouter";
import { parseMessage } from "./ws/middleware/parseMessageMiddleware";
import WSrouter from "./ws/Router/WSRouter";
import { isValidSession } from "./ws/middleware/isValidSession";
import { LobbyCleanupJob } from "./BG/lobbyCleanupJob";
import lobbyService from "./ws/Services/LobbyService/Lobby.Service";
import { ClientManager } from "./ws/modules/ClientManager";
import { removeUserFromAllNotifiers } from "./ws/Services/NotifySustem/NotifySystem";
import { StreamConsumerService } from "./ws/Services/StreamConsumerService/StreamConsumerService";
import { redis,redisSub } from "./config/redis.config";
import { LobbyServerRegistry } from "./ws/Services/LobbyServerInitService/LobbyServerInitService";


const serverId = process.env.SERVER_ID || "lobby-1";

const app = express();

const registry = new LobbyServerRegistry(redis, {
  serverId,
  host: "127.0.0.1",
  port: Number(process.env.PORT || 3000),
});




app.use(express.json());
app.use(router);

const cleanupJob = new LobbyCleanupJob();
cleanupJob.start();

registry.init();

const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer });

const clientManager = ClientManager.getInstance();
setInterval(() => {
    clientManager.forEach(ctx => {
        if ((Date.now() - ctx.lastPing) > 90000) {
            console.log("Disconect By serve, no ping");
            ctx.ws.terminate();
        }
    });
}, 10000);
const consumer = new StreamConsumerService(redisSub,clientManager);

consumer.startConsumer()
lobbyService.init(clientManager)


wss.on("connection", async (ws: WebSocket, req) =>{
    const ctx: WSContext = { ws,req };

    await runMiddlewares(ctx,[
        wsAuth
    ])


    console.log("User connected:", ctx.userId);
    (ws as any).userId = ctx.userId;
    await clientManager.addClient(ctx);

    ws.on("message",async (data)=>{

        ctx.rawMessage = data.toString();
        
         await runMiddlewares(ctx,[
            isValidSession,
            parseMessage,
            UpdateSession
        ])

        WSrouter.handle(ctx)
    })

    ws.on("close", async () => {
        const userId = (ws as any).userId;
        if (!userId) return;

        const clientManager = ClientManager.getInstance();
        await clientManager.removeClient(userId);
        removeUserFromAllNotifiers(userId);

        console.log("DISCONNECT:", userId);


        await lobbyService.onDisconnect(userId);
    });

    ws.on("error", (err) => { });

    const response: WSResponse = {
        code: 200,
        message: "Connected"
    }
    ws.send(JSON.stringify(response));
})

process.on("SIGINT", async () => {
  await registry.shutdown();
  process.exit(0);
});

export { app, httpServer, wss };
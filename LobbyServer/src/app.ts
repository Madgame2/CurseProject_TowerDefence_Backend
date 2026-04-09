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
import { LobbyService } from "./ws/Services/LobbyService/Lobby.Service";

const app = express();
app.use(express.json());
app.use(router);

const cleanupJob = new LobbyCleanupJob();
cleanupJob.start();

const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer });



wss.on("connection", async (ws: WebSocket, req) =>{
    const ctx: WSContext = { ws,req };

    await runMiddlewares(ctx,[
        wsAuth
    ])
    console.log("User connected:", ctx.userId);
    (ws as any).userId = ctx.userId;

    ws.on("message",async (data)=>{

        ctx.rawMessage = data.toString();
        
         await runMiddlewares(ctx,[
            isValidSession,
            parseMessage,
            UpdateSession
        ])

        WSrouter.handle(ctx)
    })

    ws.on("close", async ()=>{
        const userId = (ws as any).userId;
        if (!userId) return;

       const lobbyservise: LobbyService = new LobbyService();
       await lobbyservise.onDisconnect(userId);
    })

    ws.on("error", (err) => { });

    const response: WSResponse = {
        code: 200,
        message: "Connected"
    }
    ws.send(JSON.stringify(response));
})

export { app, httpServer, wss };
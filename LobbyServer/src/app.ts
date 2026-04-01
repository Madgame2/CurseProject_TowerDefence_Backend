import express from "express";
import router from "./routes/Routes";
import { Server } from "socket.io";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { wsAuth } from "./ws/middleware/wsAuthMiddleware";
import { createUpdateSessionMiddleware } from "./ws/middleware/updateSessionMiddleware";
import { WSContext } from "./ws/types/WSContext";
import { runMiddlewares } from "./ws/MiddlewareModule/runMiddlewares";
import { WSResponse } from "./types/WSResponse";
import { Json } from "sequelize/types/utils";



const app = express();
app.use(express.json());
app.use(router);



const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer });



wss.on("connection", async (ws: WebSocket, req) =>{
    const ctx: WSContext = { ws,req };

    await runMiddlewares(ctx,[
        wsAuth
    ])
    console.log("User connected:", ctx.userId);
    //socket.use(createUpdateSessionMiddleware(socket));

    ws.on("message",()=>{

    })

    ws.on("close",()=>{

    })

    ws.on("error", (err) => { });

    const response: WSResponse = {
        code: 200,
        message: "Connected"
    }
    ws.send(JSON.stringify(response));
})

export { app, httpServer, wss };
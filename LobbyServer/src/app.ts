import express from "express";
import router from "./routes/Routes";
import { Server } from "socket.io";
import { createServer } from "http";
import { wsAuth } from "./ws/middleware/wsAuthMiddleware";

const app = express();
app.use(express.json());
app.use(router);



const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: "*" }
});

io.use(wsAuth);


io.on("connection", (socket)=>{


    socket.on("disconnect",()=>{

    })
})

export { app, httpServer, io };
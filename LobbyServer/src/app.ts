import express from "express";
import router from "./routes/Routes";
import { createServer } from "http";
import { LobbyCleanupJob } from "./BG/lobbyCleanupJob";
import lobbyService from "./ws/Services/LobbyService/Lobby.Service";
import { ClientManager } from "./ws/modules/ClientManager";
import { StreamConsumerService } from "./ws/Services/StreamConsumerService/StreamConsumerService";
import { redis,redisSub } from "./config/redis.config";
import { LobbyServerRegistry } from "./ws/Services/LobbyServerInitService/LobbyServerInitService";
import { PingWatcher } from "./ws/Services/PingWatcher";
import { setupWebSocket } from "./ws/setupWebSocket";




const serverId = process.env.SERVER_ID || "lobby-1";

const app = express();
app.use(express.json());
app.use(router);

const httpServer = createServer(app);

// --- Registry ---
const registry = new LobbyServerRegistry(redis, {
    serverId,
    host: "127.0.0.1",
    port: Number(process.env.PORT || 3000),
});

// --- Services ---
const clientManager = ClientManager.getInstance();
const consumer = new StreamConsumerService(redisSub, clientManager);
const cleanupJob = new LobbyCleanupJob();
const pingWatcher = new PingWatcher();

// --- Init ---
registry.init();
lobbyService.init(clientManager);
consumer.startConsumer();
cleanupJob.start();
pingWatcher.start();

// --- WebSocket ---
const wss = setupWebSocket(httpServer);

// --- Graceful shutdown ---
process.on("SIGINT", async () => {
    console.log("Shutting down...");

    pingWatcher.stop();
    await registry.shutdown();

    process.exit(0);
});

export { app, httpServer, wss };
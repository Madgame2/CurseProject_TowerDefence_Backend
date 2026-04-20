import { Injectable } from "@nestjs/common";
import axios from "axios";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { RedisService } from "src/redis/redis.service";
import { SessionServerRedisRecord } from "src/types/sessionServerRedisrecord";
import { json } from "zod";

@Injectable()
export class MatchmakingWorker {

    redisClient ;
    constructor(private readonly redis: RedisService,
        private readonly rediScripts: LuaScripts,
    ) {
       this.redisClient = this.redis.getClient();
    }


    async start(){
        
        while (true){
            const result = await this.redisClient.evalsha(
                this.rediScripts.takeTaskSha,
                4, // 👈 теперь 4 KEYS

                "queue:matchmaking",      // KEYS[1]
                "queue:processing",       // KEYS[2]
                "lock:matchmaking:",      // KEYS[3] (prefix)
                "mm:task:",                  // KEYS[4] (task prefix)

                process.env.SERVER_NAME,  // ARGV[1] dispatcherId
                "60",                     // ARGV[2] ttl

                "queued",               // ARGV[3] expected status
                "PROCESSING"             // ARGV[4] new status
            );

            console.log(result);

            if(!result){
                await this.sleep(1000);
                continue;
            }

            await this.handleJob(result[1])
        }
    }

    private async handleJob(taskId: string) {
        console.log(taskId);

        const dispatcherId = process.env.SERVER_NAME!;
        const heartbeat = this.startHeartbeat(taskId, dispatcherId);

        try {
            await this.processTask(taskId);
        } finally {
            this.stopHeartbeat(heartbeat, taskId);
        }
    }

    private stopHeartbeat(interval: NodeJS.Timeout, taskId: string) {
        if (!interval) return;

        clearInterval(interval);
        console.log(`[${taskId}] heartbeat stopped`);
    }

    private GetServerWithLessPrecentOFOccupancy(
        servers: SessionServerRedisRecord[]
    ): SessionServerRedisRecord | null {

        let bestServer: SessionServerRedisRecord | null = null;
        let lowestLoad = Infinity;

        for (const server of servers) {

            if (!server.canAccept) continue;
            if (server.status !== "ONLINE") continue;
            if (server.maxLoad <= 0) continue;

            const loadPercent = server.currentLoad / server.maxLoad;

            if (loadPercent < lowestLoad) {
                lowestLoad = loadPercent;
                bestServer = server;
            }
        }

        return bestServer;
    }

private async processTask(taskId: string) {
    try {
        await this.delayBeforeProcessing();

        const status:string = await this.CheckTaskStatus(taskId);
        if(status!="queued"){
            await this.handleTaskFailure(taskId, status);
            return;
        }

        const server = await this.pickBestServer();
        if (!server) {
            console.warn(`[${taskId}] No available server`);
            await this.handleTaskFailure(taskId, "NO_SERVERS_AVAILABLE");
            return;
        }

        const payload = await this.loadTaskPayload(taskId);
        if (!payload) {
            console.warn(`[${taskId}] Invalid or missing payload`);
            await this.handleTaskFailure(taskId, "INVALID_PAYLOAD");
            return;
        }

        const response = await this.sendToServer(server, payload);
        if (!response) {
            console.warn(`[${taskId}] Server did not respond`);
            await this.handleTaskFailure(taskId, "SERVER_ERROR");
            return;
        }

        const redisResult = await this.markTaskAsReady(taskId, server);

        if (!redisResult?.ok) {
            console.warn(`[${taskId}] Redis state transition failed: ${redisResult?.status}`);
            this.handleTaskFailure(taskId, redisResult?.status ?? "REDIS_ERROR");
            return;
        }

        if (!redisResult.lobbyId) {
            console.warn(`[${taskId}] Missing lobbyId from redis result`);
            this.handleTaskFailure(taskId, "NO_LOBBY");
            return;
        }

        await this.notifyLobby(
            redisResult.lobbyId,
            response.sessionId,
            response.PassToken,
            server
        );

        console.log(`[${taskId}] Task successfully completed`);
    } catch (err) {
        console.error(`[${taskId}] Unexpected error during task processing:`, err);
        this.handleTaskFailure(taskId, "EXCEPTION");
    }
}

    private async CheckTaskStatus(taskID:string):Promise<string>{
        return await this.redisClient.hget(`mm:task:${taskID}`,"status") as string;
    }

    private async delayBeforeProcessing() {
        await this.sleep(10000);
    }

    private async pickBestServer() {
        const servers = await this.loadServers();
        const bestServer = this.GetServerWithLessPrecentOFOccupancy(servers);

        console.log(servers);
        console.log(bestServer);

        if (!bestServer) {
            console.warn("No available server found");
            return null;
        }

        return bestServer;
    }


    private async loadTaskPayload(taskId: string) {
        const raw = await this.redisClient.hget(`mm:task:${taskId}`, "payload");

        if (!raw) {
            console.warn(`Payload not found for task ${taskId}`);
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch {
            console.error("Invalid JSON payload");
            return null;
        }
    }


    private async sendToServer(server: any, payload: any) {
        const url = `http://${server.host}:${server.port}/EntryPoint`;

        try {
            const res = await axios.post(url, payload, { timeout: 20000 });
            console.log("ВЫПОЛНИЛ ЗАДАЧУ");
            console.log(res.data);
            return res.data;
        } catch (err) {
            console.error("Ошибка при вызове сервера:", err);
            return null;
        }
    }


    private async markTaskAsReady(taskId: string, server: any) {
        const [ok, status, lobbyId] = await this.redisClient.evalsha(
            this.rediScripts.serverRadykSha,
            4,
            `mm:task:${taskId}`,
            "stream:session-ready",
            "queue:processing",
            "lock:matchmaking:",

            "PROCESSING",
            "READY",
            server.serverId,
            server.host,
            String(server.port)
        );

        return { ok, status, lobbyId };
    }

    private async loadServers(): Promise<SessionServerRedisRecord[]> {
        const serverIds = await this.redisClient.smembers(`servers:list`);

        if (!serverIds.length) return [];

        const pipeline = this.redisClient.pipeline();

        for (const id of serverIds) {
            pipeline.hgetall(`server:${id}`);
        }

        const results = await pipeline.exec();

        return results
            .map(([err, data], i) => {
                if (err || !data) return null;

                return {
                    serverId: serverIds[i],
                    host: data.host,
                    port: Number(data.port),
                    maxLoad: Number(data.maxLoad),
                    currentLoad: Number(data.currentLoad),
                    status: data.status,
                    canAccept: data.canAccept === "1" || data.canAccept === "true"
                } as SessionServerRedisRecord;
            })
            .filter(Boolean) as SessionServerRedisRecord[];
    }


    private async handleTaskFailure(taskId: string, status: string) {
        if (status === "cancelled") {
            console.warn(`Task ${taskId} was cancelled`);

            await this.redisClient.del(`mm:task:${taskId}`);
            await this.redisClient.lrem(`queue:processing`, 0, taskId);
            await this.redisClient.lrem(`queue:matchmaking`, 0, taskId);
            return;
        }

        if (status === "READY") {
            return; 
        }

            if (status === "NO_SERVERS_AVAILABLE") {
                console.warn(`[${taskId}] No servers available, retrying later`);

                await this.redisClient.lpush("queue:matchmaking", taskId);
                await this.redisClient.lrem("queue:processing", 0, taskId);

                await this.redisClient.hset(
                    `mm:task:${taskId}`,
                    "status",
                    "QUEUED",
                );

                return;
        }
    }

    
    private async notifyLobby(lobbyId: string, sessionId: string, passToken:string, server: SessionServerRedisRecord) {
    const [servers, users] = await this.redisClient.evalsha(
        this.rediScripts.getLobbyUsersServersSha,
        2,
        `lobby:${lobbyId}:users`,
        "user:"
    );

    const sessionInfo = {
        host: server.host,
        port: server.port,
        passToken: passToken,
        sessionId: sessionId,
        lobbyId,
        users
    };

    const payload = JSON.stringify(sessionInfo);

    console.log(payload)
    for (const server of servers) {
        await this.redisClient.publish(
            `DespatchNotification:${server}`,
            payload
        );
    }
}


    private startHeartbeat(taskId: string, dispatcherId: string) {
        const lockKey = `lock:matchmaking:${taskId}`;

        console.log(lockKey);
        const interval = setInterval(async () => {
            try {
                const result = await this.redisClient.eval(
                    `
                    if redis.call("GET", KEYS[1]) == ARGV[1] then
                        return redis.call("EXPIRE", KEYS[1], ARGV[2])
                    else
                        return 0
                    end
                    `,
                    1,
                    lockKey,
                    dispatcherId,
                    60
                );

                // если мы больше не владелец lock — останавливаем heartbeat
                if (result === 0) {
                    clearInterval(interval);
                }

            } catch (err) {
                clearInterval(interval);
            }
        }, 20000);

        return interval;
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
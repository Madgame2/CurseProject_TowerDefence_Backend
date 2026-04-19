import { Injectable } from "@nestjs/common";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { RedisService } from "src/redis/redis.service";
import { SessionServerRedisRecord } from "src/types/sessionServerRedisrecord";

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

        console.log(taskId as string);
        const dispatcherId = process.env.SERVER_NAME!;
        const heartbeat = this.startHeartbeat(taskId, dispatcherId);

        await this.processTask(taskId);
    }

private GetServerWithLessPrecentOFOccupancy(
    servers: SessionServerRedisRecord[]
): SessionServerRedisRecord | null {

    let bestServer: SessionServerRedisRecord | null = null;
    let lowestLoad = Infinity;

    for (const server of servers) {

        if (!server.canAccept) continue;
        if (server.status !== "online") continue;
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
        await this.sleep(30000);

        const serverArray = await this.loadServers();

        const bestServer = this.GetServerWithLessPrecentOFOccupancy(serverArray);

        if (!bestServer) {
            console.warn("No available server found");
            return;
        }

        console.log("ВЫПОЛНИЛ ЗАДАЧУ");

        const [ok, status, lobbyId] = await this.redisClient.evalsha(
            this.rediScripts.serverRadykSha,
            4,
            `mm:task:${taskId}`,
            "stream:session-ready",
            "queue:processing",
            "lock:matchmaking:",

            "PROCESSING",
            "READY",
            bestServer.serverId,
            bestServer.host,
            String(bestServer.port)
        );

        console.log(ok, lobbyId);

        if (!ok) {
            this.handleTaskFailure(taskId, status);
            return;
        }

        await this.notifyLobby(lobbyId, bestServer);
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


    private handleTaskFailure(taskId: string, status: string) {
        if (status === "CANCELLED") {
            console.warn(`Task ${taskId} was cancelled`);
            return;
        }

        if (status === "READY") {
            return; // идемпотентно уже обработано
        }
    }
    private async notifyLobby(lobbyId: string, server: SessionServerRedisRecord) {
    const [servers, users] = await this.redisClient.evalsha(
        this.rediScripts.getLobbyUsersServersSha,
        2,
        `lobby:${lobbyId}:users`,
        "user:"
    );

    const sessionInfo = {
        host: server.host,
        port: server.port,
        passToken: "prefabToken",
        lobbyId,
        users
    };

    const payload = JSON.stringify(sessionInfo);

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
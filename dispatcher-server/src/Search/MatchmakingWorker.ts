import { Injectable } from "@nestjs/common";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { RedisService } from "src/redis/redis.service";

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

    private async processTask(taskId: string){
        await this.sleep(60000);

        console.log("ВЫПОЛНИЛ ЗАДАЧУ")
        const [ok, result] = await this.redisClient.evalsha(
            this.rediScripts.serverRadykSha,
            2,
            `mm:task:${taskId}`,
            "stream:session-ready",
            "PROCESSING",
            "READY",
            "sessionIdPrefab",
            "serverIpPrefab",
            "PortPrefab"
        )

        if(ok){

            console.log(result);
        }else{
            const status = result;

            if (status === "CANCELLED") {
                // можно удалить задачу или проигнорить
            }

            if (status === "READY") {
                // уже выполнено → просто игнор
            }

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
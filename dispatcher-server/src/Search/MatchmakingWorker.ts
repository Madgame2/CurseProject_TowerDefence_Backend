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
            const taskId = this.redisClient.evalsha(
                this.rediScripts.takeTaskSha,
                3,
                "queue:matchmaking",
                "queue:processing",
                "task:",
                process.env.SERVER_NAME,
                "60"
            )


            if(!taskId){
                await this.sleep(1000);
                continue;
            }

            await this.handleJob(taskId)
        }
    }

    private async handleJob(taskId: string) {
        const dispatcherId = process.env.SERVER_NAME!;
        const heartbeat = this.startHeartbeat(taskId, dispatcherId);

        await this.sleep(2000);
    }

    private startHeartbeat(taskId: string, dispatcherId: string) {
        const interval = setInterval(async () => {
            const lock = await this.redisClient.get(`task:${taskId}:lock`);

            if (lock !== dispatcherId) {
                clearInterval(interval);
                return;
            }

            await this.redisClient.expire(`task:${taskId}:lock`, 30);
        }, 500);

        return interval;
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
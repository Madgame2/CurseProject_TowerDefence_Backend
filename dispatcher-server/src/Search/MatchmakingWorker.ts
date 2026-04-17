import { Injectable } from "@nestjs/common";
import { RedisModule } from "src/redis/redis.module";
import { RedisService } from "src/redis/redis.service";


@Injectable()
export class MatchmakingWorker {

    redisClient ;
    constructor(private readonly redis: RedisService) {
       this.redisClient = this.redis.getClient();
    }


    async start(){
        
        while (true){
            const result = await this.redisClient.brpop("queue:matchmaking", 0);

            if (!result) continue;

            const [, jobRaw] = result;
            const job = JSON.parse(jobRaw);

            this.handleJob(job).catch(console.error);
        }
    }

    private async handleJob(job: any) {
        // твоя логика поиска сервера
        //const success = await this.findServer(job, 60_000);

        
        await this.redisClient.lpush("queue:matchmaking", JSON.stringify(job));
        
    }

}
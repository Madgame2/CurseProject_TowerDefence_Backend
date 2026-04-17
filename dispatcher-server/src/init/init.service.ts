import { Injectable, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
import { RedisService } from "src/redis/redis.service";
import { ConfigService } from "@nestjs/config";
import { MatchmakingWorker } from "src/Search/MatchmakingWorker";

@Injectable()
export class InitService implements OnModuleInit{

    private dispatcherId = randomUUID();

    
    constructor(
        private redis: RedisService,
        private mathcmaking: MatchmakingWorker,
        private config: ConfigService,
    ) {}


    private async InitMacthMaking(){
        this.mathcmaking.start();
    }

    private async InitRedis(){
        const client = this.redis.getClient();

        const port = this.config.get<number>('PORT') || 3001;
        const host = this.config.get<string>('HOST') || 'localhost';

        const url = `http://${host}:${port}`;

        console.log(`[INIT] Registering dispatcher ${this.dispatcherId}`);
        const key = `dispatcher:${this.dispatcherId}`;

            await client.set(
            key,
            JSON.stringify({
                url,
                lastHeartbeat: Date.now(),
            }),
                "EX",
                 10, // TTL 10 секунд
            );


            setInterval(async () => {
            await client.set(
                key,
                JSON.stringify({
                url,
                lastHeartbeat: Date.now(),
                }),
                
                "EX", 10,
            );
            }, 5000);
    
    }

    async onModuleInit() {
        await this.InitRedis()
        await this.InitMacthMaking();
    }

    public getId():string{
        return this.dispatcherId;
    }
}
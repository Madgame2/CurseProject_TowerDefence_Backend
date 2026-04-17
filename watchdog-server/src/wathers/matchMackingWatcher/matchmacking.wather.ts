import { Injectable } from "@nestjs/common";
import { IWatcher } from "../IWatcher";
import { RedisService } from "src/redis/redis.service";
import { LuaScripts } from "src/redis/LuaScripts.service";



@Injectable()
export class RedisMatchmackingWatcher implements IWatcher{
    name = "MatchmakingWatcher";

    constructor(private readonly redis: RedisService, private readonly luaScripts: LuaScripts){}

    async run(): Promise<void>{
        const redisClient = await this.redis.getClient();

        await redisClient.evalsha(
            this.luaScripts.returnToQeueueSha,
            2, // KEYS count
            "queue:processing",
            "queue:matchmaking"
        );
    }
}
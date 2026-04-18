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
            4, // KEYS count

            "queue:processing",        // KEYS[1]
            "queue:matchmaking",       // KEYS[2]
            "mm:task:",                // KEYS[3]
            "lock:matchmaking:",       // KEYS[4]
        );
    }
}
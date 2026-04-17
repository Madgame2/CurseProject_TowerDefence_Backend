import { Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { LuaScripts } from "./LuaScripts.service";


@Module({
    providers: [RedisService, LuaScripts],
    exports: [RedisService, LuaScripts],
})
export class RedisModule {}
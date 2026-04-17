import { Module } from "@nestjs/common";
import { MatchmakingWorker } from "./MatchmakingWorker";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { RedisModule } from "src/redis/redis.module";


@Module({
    imports: [RedisModule],
    providers:[MatchmakingWorker],
    exports: [MatchmakingWorker]
})
export class MatchmakingModule{}
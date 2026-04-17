import { Module } from "@nestjs/common";
import { RedisModule } from "src/redis/redis.module";
import { InitService } from "./init.service";
import { MatchmakingModule } from "src/Search/Matchmaking.module";


@Module({
    imports: [RedisModule, MatchmakingModule],
    providers: [InitService]
})
export class InitModule{    }
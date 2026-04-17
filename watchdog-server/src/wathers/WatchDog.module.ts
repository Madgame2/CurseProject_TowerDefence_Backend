import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "src/redis/redis.module";
import { WatchdogService } from "./WatchDog.Service";
import { RedisMatchmackingWatcher } from "./matchMackingWatcher/matchmacking.wather";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { WATCHERS } from "./tokens";


@Module({
    imports: [
        ScheduleModule.forRoot(),
        RedisModule,
    ],
    providers: [
        WatchdogService,
        RedisMatchmackingWatcher,

        {
            provide: WATCHERS,
            useFactory: (matchmaking: RedisMatchmackingWatcher) => {
                return [matchmaking];
            },
            inject: [RedisMatchmackingWatcher],
        }
    ],
})
export class WatchDogModule {}
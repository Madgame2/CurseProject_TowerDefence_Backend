import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "src/redis/redis.module";
import { WatchdogService } from "./WatchDog.Service";
import { RedisMatchmackingWatcher } from "./matchMackingWatcher/matchmacking.wather";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { WATCHERS } from "./tokens";
import { SessionServerWatcher } from "./sessionServerWatcher/sessionServer.watcher";


@Module({
    imports: [
        ScheduleModule.forRoot(),
        RedisModule,
    ],
    providers: [
        WatchdogService,
        RedisMatchmackingWatcher,
        SessionServerWatcher,
        {
            provide: WATCHERS,
            useFactory: (
                matchmaking: RedisMatchmackingWatcher,
                session: SessionServerWatcher,
            ) => {
                return [
                    matchmaking,
                    session,
                ];
            },
            inject: [RedisMatchmackingWatcher,SessionServerWatcher],
        }
    ],
})
export class WatchDogModule {}
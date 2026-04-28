import { Module } from "@nestjs/common";
import { SesionManager } from "./sessionManager";
import { RedisModule } from "src/redis/redis.module";
import { ServerStateModule } from "src/ServerStateModule/ServerState.module";
import { SessionRegistryModule } from "../SessionRegistryModule/SessionRegistru.module";
import { InitModule } from "src/init/init.module";
import { PlayerSyncManager } from "./PlayerSyncManager";
import { ClientRegistryModule } from "src/ws/ClientRegistry/ClientRegistry.Module";
import { SessionNotifier } from "../SessionNotifier";
import { SessionModule } from "../sessions.module";
import { forwardRef } from "@nestjs/common";
import { WorldModule } from "../World/WorldModuel.module";
import { PlayerEventModule } from "../PlayerEventBinder/PlayerEvent.module";


@Module({
    imports: [RedisModule, ServerStateModule, 
        SessionRegistryModule, InitModule, 
        ClientRegistryModule, forwardRef(() => SessionModule)
        ,WorldModule,PlayerEventModule ],
    providers:[SesionManager, PlayerSyncManager, SessionNotifier],
    exports:[SesionManager, PlayerSyncManager]
})
export class SessionMannagerModule{}
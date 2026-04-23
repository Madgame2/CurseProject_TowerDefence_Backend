import { Module } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { SessionRegistry } from "./SessionRegistryModule/SessionRegistry";
import { RedisModule } from "src/redis/redis.module";
import { ServerConfigService } from "src/init/ServerConfig.service";
import { ServerStateModule } from "src/ServerStateModule/ServerState.module";
import { ServerStateService } from "src/ServerStateModule/ServerState.Service";
import { SessionRegistryModule } from "./SessionRegistryModule/SessionRegistru.module";
import { InitModule } from "src/init/init.module";
import { SesionManager } from "./sessionManager/sessionManager";
import { SessionMannagerModule } from "./sessionManager/sessionManager.model";
import { SessionNotifier } from "./SessionNotifier";

@Module({
    imports: [RedisModule, ServerStateModule, SessionRegistryModule, InitModule, SessionMannagerModule],
    providers: [SessionsService],
    exports: [SessionsService],
})

export class SessionModule {}
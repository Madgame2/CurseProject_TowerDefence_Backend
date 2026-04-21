import { Module } from "@nestjs/common";
import { SesionManager } from "./sessionManager";
import { RedisModule } from "src/redis/redis.module";
import { ServerStateModule } from "src/ServerStateModule/ServerState.module";
import { SessionRegistryModule } from "../SessionRegistryModule/SessionRegistru.module";
import { InitModule } from "src/init/init.module";
import { SessionModule } from "../sessions.module";
import { RedisService } from "src/redis/redis.service";

@Module({
    imports: [RedisModule, ServerStateModule, SessionRegistryModule, InitModule],
    providers:[SesionManager],
    exports:[SesionManager]
})
export class SessionMannagerModule{}
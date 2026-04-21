import { Module } from "@nestjs/common";
import { WsMiddlewareRunner } from "./wsMidlewar.service";
import { ConnectionAuthMiddleware } from "./ConnectionAuthMiddleware/ConnectionAuthMiddleware.module";
import { SessionRegistryModule } from "src/sessions/SessionRegistryModule/SessionRegistru.module";
import { parseMessageMiddleware } from "./parseMessageMidleware/ParsseMessageMidleware";
import { PingPongMiddleware } from "./PingPongMidleware/pingPongMidleware";
import { SesionManager } from "src/sessions/sessionManager/sessionManager";
import { RedisModule } from "src/redis/redis.module";
import { InitModule } from "src/init/init.module";
import { ServerStateModule } from "src/ServerStateModule/ServerState.module";

@Module({
    imports: [SessionRegistryModule, RedisModule, ServerStateModule, InitModule],
    providers: [WsMiddlewareRunner, ConnectionAuthMiddleware,parseMessageMiddleware,PingPongMiddleware, SesionManager],
    exports: [WsMiddlewareRunner,ConnectionAuthMiddleware,parseMessageMiddleware,PingPongMiddleware]
})
export class MiddlewareModule{}
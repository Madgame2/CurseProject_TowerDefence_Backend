import { Module } from "@nestjs/common";
import { WsMiddlewareRunner } from "./wsMidlewar.service";
import { ConnectionAuthMiddleware } from "./ConnectionAuthMiddleware/ConnectionAuthMiddleware.module";
import { SessionRegistryModule } from "src/sessions/SessionRegistryModule/SessionRegistru.module";
import { parseMessageMiddleware } from "./parseMessageMidleware/ParsseMessageMidleware";
import { PingPongMiddleware } from "./PingPongMidleware/pingPongMidleware";

@Module({
    imports: [SessionRegistryModule],
    providers: [WsMiddlewareRunner, ConnectionAuthMiddleware,parseMessageMiddleware,PingPongMiddleware],
    exports: [WsMiddlewareRunner,ConnectionAuthMiddleware,parseMessageMiddleware,PingPongMiddleware]
})
export class MiddlewareModule{}
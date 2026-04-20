import { Module } from "@nestjs/common";
import { WsMiddlewareRunner } from "./wsMidlewar.service";
import { ConnectionAuthMiddleware } from "./ConnectionAuthMiddleware/ConnectionAuthMiddleware.module";
import { SessionRegistryModule } from "src/sessions/SessionRegistryModule/SessionRegistru.module";


@Module({
    imports: [SessionRegistryModule],
    providers: [WsMiddlewareRunner, ConnectionAuthMiddleware],
    exports: [WsMiddlewareRunner,ConnectionAuthMiddleware]
})
export class MiddlewareModule{}
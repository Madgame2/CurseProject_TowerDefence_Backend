import { Module } from "@nestjs/common";
import { InitService } from "./init.service";
import { ServerConfigService } from "./ServerConfig.service";
import { RedisModule } from "src/redis/redis.module";


@Module({
    imports: [RedisModule],
    providers: [InitService, ServerConfigService],
    exports: [InitService, ServerConfigService]
})
export class InitModule{}
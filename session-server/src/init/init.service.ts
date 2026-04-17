import { Injectable, OnModuleInit } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { ServerConfigService } from "./ServerConfig.service";
import { ServerRedisRecord } from "src/types/ServerRedisRecord";
import { config } from "process";
import { LuaScripts } from "src/redis/LuaScripts.service";

@Injectable()
export class InitService implements OnModuleInit{

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ServerConfigService,
        private readonly luaScripts: LuaScripts
    ){}


    async onModuleInit() {
        const redisClient = await this.redisService.getClient();

        const configs = this.configService.config;
        const serverId = configs.serverId;


        const result = await redisClient.evalsha(
            this.luaScripts.registerServerSha,
            2,
            "servers:list",
            `server:${serverId}`,
            serverId,
            configs.host,
            configs.port.toString(),
            configs.maxLoad.toString(),
            String(configs.canAccept)
    );

    if (result === 1) {
        console.log("Server registered");
    } else {
        console.log("Server already exists");
    }
    }
}
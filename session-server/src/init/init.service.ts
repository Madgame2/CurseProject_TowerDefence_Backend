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

    private startHeartbeat(serverId: string) {
    const interval = 3000; // каждые 3 сек
    const ttl = 20;        // живёт 10 сек

    setInterval(async () => {
        try {
            const redisClient = await this.redisService.getClient();

            await redisClient.set(
                `server:${serverId}:alive`,
                "1",
                "EX",
                 ttl
            );

        } catch (e) {
            console.error("Heartbeat error", e);
        }
    }, interval);
}

    async onModuleInit() {
        await this.luaScripts.ensureReady();
        const redisClient = await this.redisService.getClient();

        const configs = this.configService.config;
        const serverId = configs.serverId;


        console.log("REGISTER SHA:", this.luaScripts.registerServerSha);
        const result = await redisClient.evalsha(
            this.luaScripts.registerServerSha,
            2,
            "servers:list",
            `server:${serverId}`,
            serverId,
            configs.host,
            configs.port.toString(),
            configs.maxLoad.toString(),
            String(configs.canAccept),
            String(configs.status)
    );

    if (result === 1) {
        console.log("Server registered");
    } else {
        console.log("Server already exists");
    }

        this.startHeartbeat(serverId);

    }
}
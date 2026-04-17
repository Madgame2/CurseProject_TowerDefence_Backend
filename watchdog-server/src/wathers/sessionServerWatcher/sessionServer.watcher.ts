import { Injectable } from "@nestjs/common";
import { IWatcher } from "../IWatcher";
import { RedisService } from "src/redis/redis.service";
import axios from "axios";
import { LuaScripts } from "src/redis/LuaScripts.service";

@Injectable()
export class SessionServerWatcher implements IWatcher{
    name: string = "SessionWatcher";

    constructor(private readonly redisService: RedisService,
        private readonly luaScripts: LuaScripts
     ){}

    async run(){
        const redisClient = await this.redisService.getClient()

        const allServers = await redisClient.smembers("servers:list")

        for (const server of allServers) {

            const alive = await redisClient.exists(`server:${server}:alive`);

            if (alive) {
                await redisClient.del(`server:${server}:missTTL`);
                continue;
            }

            const missTTLKey = `server:${server}:missTTL`;

            const missTTLCount = await redisClient.incr(missTTLKey);

            // 🧠 первый раз может не быть TTL → ставим expire
            if (missTTLCount === 1) {
                await redisClient.expire(missTTLKey, 60);
            }

            if (missTTLCount >= 10) {

                const serverData = await redisClient.hgetall(`server:${server}`);
                const host = serverData.host;
                const port = Number(serverData.port);

                try{
                    await axios.get(`http://${host}:${port}/health`,{
                        timeout: 2000
                    })

                    await redisClient.del(missTTLKey);
                }catch(e){
                    console.log("server dead");

                    await redisClient.evalsha(
                        this.luaScripts.deleteSessionServerSha,
                        4,
                        "servers:list",
                        `server:${server}`,
                        `server:${server}:alive`,
                        `server:${server}:missTTL`,
                        server

                    )
                }
            }
        }
    }
}
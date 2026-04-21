import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { RedisService } from "src/redis/redis.service";
import { ServerConfigService } from "src/init/ServerConfig.service";
import { SessionRegistry } from "../SessionRegistryModule/SessionRegistry";
import { ServerStateService } from "src/ServerStateModule/ServerState.Service";
import { SessionState } from "src/types/SessionState.enum";
import { CreateSessionRequest } from "src/EntryPoint/dto/createSessionRequestDTO";
import { Session } from "src/types/session";
import { CleanUpdSession } from "src/types/CleanUpSession";


@Injectable()
export class SesionManager{


    constructor(private readonly redisService: RedisService,
            private readonly luaScripts: LuaScripts,
            private readonly configs: ServerConfigService,
            private readonly sessionRegistry: SessionRegistry,
            private serverState: ServerStateService,){}

    async createNesession(req: CreateSessionRequest){

            const redisClient = await this.redisService.getClient();
            const config = this.configs.config;
        
            const sessionId = randomUUID();
            const passToken = randomUUID();
        
            console.log(`lobby:${req.LobbyId}:users`, `server:${config.serverId}:${sessionId}:metadata`, `server:${config.serverId}`)

            const resultJson = await redisClient.evalsha(
                    this.luaScripts.createSessioMetaDataSha,
                    3,
                    `lobby:${req.LobbyId}:users`,
                    `server:${config.serverId}:${sessionId}:metadata`,
                    `server:${config.serverId}`,
                    sessionId,
                    req.matchDifficulty,
                    String(req.Seed),
                    passToken,
                    SessionState.CREATING
                ) as string;
        
                if (!resultJson) {
                throw new Error('Lua script returned empty result');
                }
        
                let resultObj: any;
        
                try {
                    resultObj = JSON.parse(resultJson);
                } catch (e) {
                    throw new Error('Failed to parse session JSON from Redis');
                }
        
            const session = new Session(
                String(resultObj.SessionID),
                resultObj.Dificulty,
                Number(resultObj.Seed),
                String(resultObj.PassToken),
                resultObj.Players,
            );
        
            session.on("ended", this.cleanSessoin.bind(this))

            // сюда добавляем в runtime cache
            this.sessionRegistry.set(session);
                
        
        return session;
    }

    private async cleanSessoin(Payload: CleanUpdSession){

        const redisClient = await this.redisService.getClient()
        const config = this.configs.config;

        console.log("УДАЛЯЮ С РЕДИСА ");
        await redisClient.evalsha(
            this.luaScripts.DeleteSessionRecordsSha,
            2,
            `server:${config.serverId}:${Payload.sessionId}`,
            `server:${config.serverId}`
        )

        this.sessionRegistry.remove(Payload.sessionId);
        this.serverState.removeSession()
    }

    removeClient(sessionId:string, UserId: string){
        const session = this.sessionRegistry.get(sessionId);
        session?.removePlayer(UserId);
    }

    addPlayer(sessionId: string, PlayerId:string){
        const session = this.sessionRegistry.get(sessionId);
        session?.addPlayer(PlayerId);
    }
}
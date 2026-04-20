import { Injectable } from "@nestjs/common";
import { CreateSessionRequest } from "src/EntryPoint/dto/createSessionRequestDTO";
import { randomUUID } from "crypto";
import { RedisService } from "src/redis/redis.service";
import { LuaScripts } from "src/redis/LuaScripts.service";
import { ServerConfigService } from "src/init/ServerConfig.service";
import { SessionState } from "src/types/SessionState.enum";
import { Session } from "src/types/session";
import { SessionRegistry } from "./SessionRegistryModule/SessionRegistry";
import { ServerStateService } from "src/ServerStateModule/ServerState.Service";

@Injectable()
export  class SessionsService{

    constructor(private readonly redisService: RedisService,
         private readonly luaScripts: LuaScripts,
          private readonly configs: ServerConfigService,
            private readonly sessionRegistry: SessionRegistry,
        private serverState: ServerStateService,){}

    async tryCreateSession(req: CreateSessionRequest): Promise<Session> {
    try {

        this.serverState.addSession();

        const redisClient = await this.redisService.getClient();
        const config = this.configs.config;

        const sessionId = randomUUID();
        const passToken = randomUUID();

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

        const session: Session = {
        SessionID: resultObj.SessionID,
        Dificulty: resultObj.Dificulty,
        Seed: Number(resultObj.Seed),
        PassToken: resultObj.PassToken,
        Players: resultObj.Players,
        onlinePlayersId: [],
        SessionState: resultObj.SessionState,
        };

        // сюда добавляем в runtime cache
        this.sessionRegistry.set(session);
        

        return session;

    } catch (err) {
        console.error('[SessionsService] tryCreateSession error:', err);
        this.serverState.removeSession();
        throw err;
    }
    }
}
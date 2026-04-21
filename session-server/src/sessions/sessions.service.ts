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
import { SesionManager } from "./sessionManager/sessionManager";

@Injectable()
export  class SessionsService{

    constructor(
    private serverState: ServerStateService,
    private readonly sessionManager: SesionManager
    ){}

    async tryCreateSession(req: CreateSessionRequest): Promise<Session> {
    try {

        this.serverState.addSession();

        return this.sessionManager.createNesession(req);

    } catch (err) {
        console.error('[SessionsService] tryCreateSession error:', err);
        this.serverState.removeSession();
        throw err;
    }
    }
}
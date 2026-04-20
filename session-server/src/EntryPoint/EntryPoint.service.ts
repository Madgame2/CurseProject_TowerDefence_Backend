import { Injectable } from "@nestjs/common";
import { CreateSessionRequest } from "./dto/createSessionRequestDTO";
import { ServerStateService } from "src/ServerStateModule/ServerState.Service";
import { SessionsService } from "src/sessions/sessions.service";
import { ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { Session } from "src/types/session";


@Injectable()
export class EntryPointService{

    constructor(private serverState: ServerStateService, private readonly sessionsService: SessionsService){}

    async tryCreateSessionReserv(req: CreateSessionRequest){
        if(!this.serverState.CanAccept()){
            console.log("НЕ МОГУ ПРИЯНТЬ(");
            throw new ServiceUnavailableException(
                'Session server cannot accept new sessions'
            );
        }

        const result : Session = await this.sessionsService.tryCreateSession(req);
        return {
            sessionId: result.SessionID,
            PassToken: result.PassToken
        };
    }
}
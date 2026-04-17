import { LobbyNotFoundException } from "../../Exceptions/LobbyNotFoundException";
import { Dispatcher } from "../../types/Dispatcher";
import { LobbyService } from "../LobbyService/Lobby.Service";
import { redis } from "../../../config/redis.config";
import { NoDespathcersException } from "../../Exceptions/NoDespatchersExcaption";
import { MatchMakingRequestDTO } from "../../dto/MatchMakingRequestDTO";
import { WrongLobbyHostException } from "../../Exceptions/WrongLobbyHostExceotion";
import { InvalidMatchmakingRequestException } from "../../Exceptions/InvalidMatchmakingRequestException";
import { QueueFullException } from "../../Exceptions/QueueFullException";
import { DispatcherUnavailableException } from "../../Exceptions/DispatcherUnavailableException";
import axios from "axios";
import { randomUUID } from "crypto";
import { RedisScripts } from "../../../redis/scriptsLoader";

export class SessionSearchService{

    _lobbyService = new LobbyService

    public async StartSerach(userID:string ,dto :MatchMakingRequestDTO ){
        console.log("!SessionSearch!")

        const lobby = await  this._lobbyService.GetLobby(dto.LobbyId);
        if(!lobby){
            throw new LobbyNotFoundException()
        }
        console.log("!SessionSearch!")
        console.log(lobby)

        if(lobby.host != userID){
            throw  new WrongLobbyHostException;
        }

        try {

            const TaskID = randomUUID();
            const task ={
                type: "matchmaking",
                TaskID: TaskID,
                lobbyId: dto.LobbyId,
                payload: dto,
                status: "queued",
                createdAt: Date.now()
            };

            await redis.evalsha(
                RedisScripts.matchmakingEnqueueSha,
                3,
                `index:lobby:${dto.LobbyId}:lastTask`,
                `queue:matchmaking`,
                `mm:task:${TaskID}`,
                TaskID,
                dto.LobbyId,
                Date.now().toString(),
                JSON.stringify(dto) // 👈 ВОТ ЭТО ТЫ ЗАБЫЛ
            );
            // 2xx = success
                return {
                    status: "queued",
                    lobbyId: dto.LobbyId
                };
    } catch (err: any) {

        if (err.response) {
            const status = err.response.status;

            if (status === 400) {
                throw new InvalidMatchmakingRequestException();
            }

            if (status === 409) {
                throw new QueueFullException();
            }

            if (status === 503) {
                throw new DispatcherUnavailableException();
            }
    }

    throw new Error("Dispatcher request failed");
}
            
    }

    private GetBestDespather(dispatchers: Dispatcher[]): Dispatcher {
        if (!dispatchers.length) {
            throw new Error("No dispatchers available");
        }

        let best = dispatchers[0];

        for (let i = 1; i < dispatchers.length; i++) {
            const current = dispatchers[i];

            if (current!.lastHeartbeat > best!.lastHeartbeat) {
                best = current;
            }
        }

        return best!;
    }

    private async getListOfDispatchers(): Promise<Dispatcher[]> {
        const keys = await redis.keys("dispatcher:*");

        if (!keys.length) return [];

        const raw = await Promise.all(
            keys.map(k => redis.get(k))
        );

    return raw
        .map((d, i) => {
            if (!d) return null;

            const parsed = JSON.parse(d);

            const parts = keys[i]!.split(":");
            if (parts.length < 2) return null;

            const id = parts[1];

            return {
                id,
                url: parsed.url,
                lastHeartbeat: parsed.lastHeartbeat
            };
        })
        .filter((d): d is Dispatcher => d !== null);
    }
}
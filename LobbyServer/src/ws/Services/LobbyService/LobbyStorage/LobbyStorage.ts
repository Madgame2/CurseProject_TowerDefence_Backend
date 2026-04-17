import { Lobby } from "../../../types/Lobby"
import Redis from "ioredis";
import { redis, redisSub } from "../../../../config/redis.config";
import { LobbyEvent } from "../../../types/LobbyEvent";
import { ILobbyRepository } from "../LobbyRepository/ILobbyRepository";
import { Lobbyreposiory } from "../LobbyRepository/Imp/LobbyReposiotory.Redis";

import { Notify } from "../../NotifySustem/NotifySystem";

class LobbyStorage {

    private _lobRep : ILobbyRepository = new Lobbyreposiory
    private static instance: LobbyStorage;

    private lobbies = new Map<string, Lobby>();
    private host_lobbies = new Map<string, Lobby>();

    private _isInit: Boolean = false;

    public get isInit():Boolean{
        return this._isInit;
    }

    private constructor(private redis: Redis, private sub: Redis) {}

    static getInstance(redis: Redis, sub: Redis): LobbyStorage {
        if (!LobbyStorage.instance) {
            LobbyStorage.instance = new LobbyStorage(redis, sub);
        }
        return LobbyStorage.instance;
    }

    async init() {
        // 1. загрузка
        const ids = await this.redis.smembers("lobbies");

        for (const id of ids) {
            const [host, inviteCode, users, headerImage, hostName] = await Promise.all([
                this.redis.get(`lobby:${id}:host`),
                this.redis.get(`lobby:${id}:inviteCode`),
                this.redis.smembers(`lobby:${id}:users`),
                this.redis.get(`lobby:${id}:headerImage`),
                this.redis.get(`lobby:${id}:hostName`)
            ]);

            if (!host || !inviteCode) {
                console.warn(`Lobby ${id} is corrupted, skipping`);
                continue;
            }

            const newLobbyElem : Lobby = new Lobby(id,host,hostName!,inviteCode,headerImage!);
            newLobbyElem.users = users;
            this.lobbies.set(id, newLobbyElem);

            this.host_lobbies.set(newLobbyElem.host!,newLobbyElem);
        }

        // 2. подписка
        await this.sub.subscribe("lobby_updates");

        this.sub.on("message", async (_, message) => {
            const event: LobbyEvent = JSON.parse(message);

            if (!event.lobbyId) return;

            console.log("MessageFrom redis", event);
            switch (event.type) {
                case "LOBBY_CREATED":
                case "LOBBY_UPDATED": {
                    let lobby =
                        event.lobby ??
                        this.lobbies.get(event.lobbyId) ??
                        await this._lobRep.getLobby(event.lobbyId);

                    if (lobby) {
                        this.lobbies.set(event.lobbyId, lobby);

                        this.host_lobbies.set(lobby.host!, lobby)
                    }

                    event.lobby = lobby

                    Notify(event);

                    return;
                }

                case "LOBBY_DELETED":

                    const lobbyId = this.lobbies.get(event.lobbyId)!.id
                    this.lobbies.delete(event.lobbyId);
                    this.host_lobbies.delete(lobbyId)
                    Notify(event);
                    break;
            }

            
        });

        this.sub.on("error", console.error);

        this._isInit = true
    }

    get(id: string): Lobby | undefined {
        return this.lobbies.get(id);
    }

    getByHost(id:string): Lobby | undefined{
        return this.host_lobbies.get(id);
    }

    getAll(): Lobby[] {
        return [...this.lobbies.values()];
    }

}


export const lobbyStorage = LobbyStorage.getInstance(redis, redisSub);
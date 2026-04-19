import { Lobby } from "../../../types/Lobby"
import Redis from "ioredis";
import { redis, redisSub } from "../../../../config/redis.config";

class LobbyStorage {
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
        await this.loadLobbies();

        this._isInit = true;
    }

    private async loadLobbies() {
        const ids = await this.redis.smembers("lobbies");

        for (const id of ids) {
            const data = await this.loadLobbyData(id);
            if (!data) continue;

            const lobby = this.createLobbyFromData(id, data);

            this.lobbies.set(id, lobby);
            this.host_lobbies.set(lobby.host!, lobby);
        }
    }

    private async loadLobbyData(id: string) {
        const [host, inviteCode, users, headerImage, hostName] = await Promise.all([
            this.redis.get(`lobby:${id}:host`),
            this.redis.get(`lobby:${id}:inviteCode`),
            this.redis.smembers(`lobby:${id}:users`),
            this.redis.get(`lobby:${id}:headerImage`),
            this.redis.get(`lobby:${id}:hostName`)
        ]);

        if (!host || !inviteCode) {
            console.warn(`Lobby ${id} is corrupted, skipping`);
            return null;
        }

        return { host, inviteCode, users, headerImage, hostName };
    }

    private createLobbyFromData(id: string, data: any): Lobby {
        const lobby = new Lobby(
            id,
            data.host,
            data.hostName ?? "",
            data.inviteCode,
            data.headerImage ?? ""
        );

        lobby.users = data.users ?? [];

        return lobby;
    }

    delete(lobbyId:string){
        const lobby = this.lobbies.get(lobbyId);
        if (!lobby) return;
        
        this.lobbies.delete(lobbyId);
        this.host_lobbies.delete(lobby.host!);
    }
    
    set(lobbyId:string, lobby:Lobby){
        this.lobbies.set(lobbyId, lobby);
        this.host_lobbies.set(lobby.host!, lobby);
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
import { ILobbyRepository } from "../ILobbyRepository";
import { redis } from "../../../../../config/redis.config";
import { Lobby } from "../../../../types/Lobby";

export class Lobbyreposiory implements ILobbyRepository{

    async getUserLobby(userId: string): Promise<string | null> {
        return await redis.get(`user:${userId}:lobby`);
    }

    async getLobbyUsers(lobbyId: string): Promise<string[]> {
        return await redis.smembers(`lobby:${lobbyId}:users`);
    }

    async isUserInLobby(userId: string): Promise<boolean> {
        const lobbyId = await this.getUserLobby(userId);
        return lobbyId !== null;
    }

    async getLobbyHost(lobbyId: string): Promise<string | null> {
        return await redis.get(`lobby:${lobbyId}:host`);
    }

    async setLobbyHost(lobbyId: string, userId: string): Promise<void> {
        await redis.set(`lobby:${lobbyId}:host`, userId);
    }

    async addUserToLobby(lobbyId: string, userId: string): Promise<void> {
        await redis.sadd(`lobby:${lobbyId}:users`, userId);
        await redis.set(`user:${userId}:lobby`, lobbyId);
    }

    async removeUserFromLobby(lobbyId: string, userId: string): Promise<void> {
        await redis.srem(`lobby:${lobbyId}:users`, userId);
        await redis.del(`user:${userId}:lobby`);
    }

    async getLobbyInviteCode(lobbyId: string): Promise<string| null>{
        return await redis.get(`lobby:${lobbyId}:inviteCode`);
    }

    async getLobbyheaderImage(LobbyID:string):Promise<string|null>{
        return await redis.get(`lobby:${LobbyID}:headerImage`);
    }

    async getLobbyNickName(LobbyID:string):Promise<string|null>{
        return await redis.get(`lobby:${LobbyID}:hostName`);
    }

async getLobby(lobbyId: string): Promise<Lobby | null> {
    const results = await redis.pipeline()
        .smembers(`lobby:${lobbyId}:users`)
        .get(`lobby:${lobbyId}:host`)
        .get(`lobby:${lobbyId}:headerImage`)
        .get(`lobby:${lobbyId}:inviteCode`)
        .get(`lobby:${lobbyId}:hostName`)
        .exec();

    if (!results) return null;

    const users = results[0]?.[1] as string[] ?? [];
    const host = results[1]?.[1] as string | null;
    const headerImage = results[2]?.[1] as string | null;
    const inviteCode = results[3]?.[1] as string | null;
    const hostName = results[4]?.[1] as string | null;

    if (!host || !inviteCode) return null;

    const lobby = new Lobby(
        lobbyId,
        host,
        hostName ?? "",
        inviteCode,
        headerImage ?? ""
    );

    lobby.users = users;

    return lobby;
}

    async getUserLobbyObj(userId: string): Promise<Lobby | null> {
        const lobbyId = await this.getUserLobby(userId);
        if (!lobbyId) return null;
        return this.getLobby(lobbyId);
    }

    async deleteLobby(lobbyId: string): Promise<void> {
    const users = await this.getLobbyUsers(lobbyId);
    for (const userId of users) {
        await this.removeUserFromLobby(lobbyId, userId);
    }
    await redis.del(`lobby:${lobbyId}:host`);

    await redis.del(`lobby:${lobbyId}:users`);
}
}
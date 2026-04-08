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

    async getLobby(lobbyId: string): Promise<Lobby | null> {
        const users = await this.getLobbyUsers(lobbyId);
        if (users.length === 0) return null;

        const host = await this.getLobbyHost(lobbyId);
        if (!host) return null;

        // создаём объект Lobby с текущим host и пользователями
        const lobby = new Lobby(lobbyId, host);
        lobby.users = users; // обновляем список пользователей, так как конструктор добавляет только host

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
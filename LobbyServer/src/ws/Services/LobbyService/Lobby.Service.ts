import { UserAlreadInLobbyException } from "../../Exceptions/UserAlreadyInLobbyException";
import { ILobbyRepository } from "./LobbyRepository/ILobbyRepository"
import crypto from "crypto";
import { UnitOfWork } from "../../../services/UnitOfWork/UnitOfWork";
import { redis } from "../../../config/redis.config";
import { LobbyNotFoundException } from "../../Exceptions/LobbyNotFoundException";
import { LobbyFullException } from "../../Exceptions/LobbyFullException";
import { Lobby } from "../../types/Lobby";
import { Lobbyreposiory } from "./LobbyRepository/Imp/LobbyReposiotory.Redis";

export class LobbyService{

    private lobbyrep:ILobbyRepository = new Lobbyreposiory();
    //private _lobbyRep : ILobbyRepository = new Lobbyreposiory;
    private uof = new UnitOfWork(redis);

public async CreateLobby(hadmaster: string): Promise<Lobby | null> {
    console.log("startCreate");
    await this.uof.start();
    console.log("UOW started");

    try {
        // Проверка существующего лобби через обычный get
        const userLobby = await this.lobbyrep.getUserLobby(hadmaster);

        console.log("userLoby:", userLobby);
        if (userLobby) {
            throw new UserAlreadInLobbyException(hadmaster, userLobby);
        }
        console.log("noUserLobby");

        // Создание нового lobby
        const newLobbyId = crypto.randomUUID();

        // Сохраняем все данные в Redis через MULTI
        await this.uof.redisCommand(async (multi) => {
            multi.set(`lobby:${newLobbyId}:host`, hadmaster);
            multi.sadd(`lobby:${newLobbyId}:users`, hadmaster);
            multi.set(`user:${hadmaster}:lobby`, newLobbyId);
            await multi.exec(); // exec вызываем только один раз
        });

        // Создаём объект Lobby
        const lobby = new Lobby(newLobbyId, hadmaster);

        await this.uof.commit();
        return lobby;
    } catch (e) {
        await this.uof.rollback();
        throw e;
    }
}

    public async joinLobby(userId: string, newLobbyId:string): Promise<void> {
    await this.uof.start(); 

    try {
        const userLobby = await this.uof.lobby!.getUserLobbyObj(userId);   

        if (userLobby) {
            await this.handleLobbyLeaderLeaving(userLobby.id, userId);
        }

        
        const newLobby = await this.uof.lobby!.getLobby(newLobbyId);
        if (!newLobby) throw new LobbyNotFoundException(newLobbyId);
        
        
        if (newLobby.isFull) throw new LobbyFullException(newLobbyId, newLobby.maxSize);

        
        this.uof.redisCommand(multi => {
            multi.sadd(`lobby:${newLobbyId}:users`, userId);
            multi.set(`user:${userId}:lobby`, newLobbyId);
        });

        await this.uof.commit(); 
    } catch (e) {
        await this.uof.rollback(); 
        throw e;
    }
    }

public async onDisconnect(userId: string) {
    const MAX_RETRIES = 5;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
                const lobbyId = await this.uof.lobby!.getUserLobby(userId);
                if (!lobbyId) return;

                // следим за изменениями
                await redis.watch(
                    `lobby:${lobbyId}:users`,
                    `lobby:${lobbyId}:host`
                );

                const users = await redis.smembers(`lobby:${lobbyId}:users`);
                const host = await redis.get(`lobby:${lobbyId}:host`);

                // если юзера уже нет — выходим (идемпотентность)
                if (!users.includes(userId)) {
                    await redis.unwatch();
                    return;
                }

                const remaining = users.filter(u => u !== userId);

                const multi = redis.multi();

                // удаляем игрока
                multi.srem(`lobby:${lobbyId}:users`, userId);
                multi.del(`user:${userId}:lobby`);

                if (host === userId) {
                    if (remaining.length > 0) {
                        multi.set(`lobby:${lobbyId}:host`, remaining[0]!);
                    } else {
                        multi.del(`lobby:${lobbyId}:host`);
                        multi.del(`lobby:${lobbyId}:users`);
                    }
                }

                const result = await multi.exec();
                if (result === null) {
                    continue;
                }
                return;
            } catch (e) {
                console.error(`Disconnect error (attempt ${attempt}):`, e);
            }
        }
        console.error(`Failed to safely disconnect user ${userId} after retries`);
    }

    public async handleLobbyLeaderLeaving(lobbyId: string, leavingUserId: string) {
        const lobby = await this.uof.lobby!.getLobby(lobbyId);
        if (!lobby) return;

        const remainingPlayers = lobby.users.filter(p => p !== leavingUserId);

        this.uof.redisCommand(multi => {
            // удаляем игрока
            multi.srem(`lobby:${lobbyId}:users`, leavingUserId);
            multi.del(`user:${leavingUserId}:lobby`);

            if (lobby.host === leavingUserId) {
                if (remainingPlayers.length > 0) {
                    multi.set(`lobby:${lobbyId}:host`, remainingPlayers[0]!);
                } else {
                    // удаляем лобби целиком
                    multi.del(`lobby:${lobbyId}:host`);
                    multi.del(`lobby:${lobbyId}:users`);
                }
            }
        });
    }
}


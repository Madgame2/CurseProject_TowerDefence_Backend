import { UserAlreadInLobbyException } from "../../Exceptions/UserAlreadyInLobbyException";
import { ILobbyRepository } from "./LobbyRepository/ILobbyRepository"
import crypto from "crypto";
import { UnitOfWork } from "../../../services/UnitOfWork/UnitOfWork";
import { redis } from "../../../config/redis.config";
import { LobbyNotFoundException } from "../../Exceptions/LobbyNotFoundException";
import { LobbyFullException } from "../../Exceptions/LobbyFullException";
import { Lobby } from "../../types/Lobby";
import { Lobbyreposiory } from "./LobbyRepository/Imp/LobbyReposiotory.Redis";
import { ProfileService } from "../ProfileSirevice/ProfileService";
import { LobbyUser } from "../../types/LobbyUser";
import { lobbyStorage } from "./LobbyStorage/LobbyStorage";
import { LobbyLua } from "../../../redis/lobbyLua";
import { LobbyEvents } from "../NotifySustem/Events/LobbyEvents";


export class LobbyService{

    private lobbyrep:ILobbyRepository = new Lobbyreposiory();
    private uof = new UnitOfWork(redis);
    private lobyStorage = lobbyStorage

    public async GetLobbyByHostId(HostId: string) :Promise<Lobby| null>{
        const bufferedLobby = this.lobyStorage.getByHost(HostId);
        if(bufferedLobby){
            return  bufferedLobby;
        }

         const lobbyId = await redis.get(`user:${HostId}:lobby`);
            if (!lobbyId) {
                return null;
            }
        
        const [host, inviteCode, hostName, headerImage] = await redis.mget([
            `lobby:${lobbyId}:host`,
            `lobby:${lobbyId}:inviteCode`,
            `lobby:${lobbyId}:hostName`,
            `lobby:${lobbyId}:headerImage`,
        ]);

        if (!host) {
            return null;
        }

        const lobby: Lobby = new Lobby(lobbyId,host,hostName!,inviteCode!,headerImage!); 

        return lobby;
    }

    public async GetAvailableLobbys(userId:string):Promise<Lobby[]>{

        if(!this.lobyStorage.isInit){
            await this.lobyStorage.init()
        }

        const  lobbyID =  await this.lobbyrep.getUserLobby(userId); 

        let allLobys: Lobby[] = this.lobyStorage.getAll();

        allLobys = allLobys.filter(i=>i.id!=lobbyID);

        allLobys.sort((a, b) => {
            const aFull = a.users.length >= a.maxSize;
            const bFull = b.users.length >= b.maxSize;

            // если a не полный, b полный → a раньше
            if (!aFull && bFull) return -1;

            // если a полный, b не полный → b раньше
            if (aFull && !bFull) return 1;

            // иначе равны по приоритету
            return 0;
        });

        return allLobys;
    }

    public async GetLobby(lobbyId:string):Promise<Lobby|null>{
        const lobby = this.lobyStorage.get(lobbyId);
        if(!lobby){
            return null;
        }

        
        const profiles = await Promise.all(
            lobby.users.map(async (id: string) => {
                const userProfile = await ProfileService.getProfile(id);

                return {
                    id: userProfile!.id.toString(),
                    NickName: userProfile!.nickname
                } as LobbyUser;
            })
        );

        lobby.usersProfiles = profiles;

        return lobby
    }

    public async GetUserLobbyObj(userId: string): Promise<Lobby | null> {
        const lobby = await this.lobbyrep.getUserLobbyObj(userId);

        if (!lobby) return null;

        const profiles = await Promise.all(
            lobby.users.map(async (id: string) => {
                const userProfile = await ProfileService.getProfile(id);

                return {
                    id: userProfile!.id.toString(),
                    NickName: userProfile!.nickname
                } as LobbyUser;
            })
        );

        lobby.usersProfiles = profiles;

        console.log(lobby);

        return lobby;
    }

    private generateInviteCode():string{
        const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без похожих символов
        const CODE_LENGTH = 8;

        let code = '';

        for (let i = 0; i < CODE_LENGTH; i++) {
            const index = Math.floor(Math.random() * ALPHABET.length);
            code += ALPHABET[index];
        }

        // формат AAAA-BBBB
        return code.slice(0, 4) + '-' + code.slice(4);
    }

    public async CreateLobby(hadmaster: string): Promise<Lobby | null> {
        console.log("startCreate");
        await this.uof.start();
        console.log("UOW started");

        try {
            // Проверка существующего лобби через обычный get
            const userLobby = await this.lobbyrep.getUserLobby(hadmaster);
            const hadmasterProfile = await ProfileService.getProfile(hadmaster);

            if (userLobby) {
                throw new UserAlreadInLobbyException(hadmaster, userLobby);
            }

            // Создание нового lobby
            const newLobbyId = crypto.randomUUID();
            const inviteCode = this.generateInviteCode()

            // Сохраняем все данные в Redis через MULTI
            await this.uof.redisCommand(async (multi) => {
                    multi.set(`lobby:${newLobbyId}:host`, hadmaster);
                    multi.sadd(`lobby:${newLobbyId}:users`, hadmaster);
                    multi.set(`user:${hadmaster}:lobby`, newLobbyId);
                    multi.set(`lobby:${newLobbyId}:inviteCode`,inviteCode);
                    multi.set(`lobby:${newLobbyId}:hostName`,hadmasterProfile!.nickname);
                    multi.set(`lobby:${newLobbyId}:headerImage`,hadmasterProfile!.headerImageSource);
                    multi.set(`invite:${inviteCode}`, newLobbyId);

                multi.sadd("lobbies",newLobbyId);
                await multi.exec(); // exec вызываем только один раз
            });

            // Создаём объект Lobby
            const lobby = new Lobby(newLobbyId, hadmaster,hadmasterProfile!.nickname,inviteCode, hadmasterProfile!.headerImageSource);
            const profiles = await Promise.all(
                lobby.users.map(async (id: string) => {
                    const userProfile = await ProfileService.getProfile(id);

                    return {
                        id: userProfile!.id.toString(),
                        NickName: userProfile!.nickname
                    } as LobbyUser;
                })
            );
            lobby.usersProfiles = profiles

            await this.uof.commit();

            await LobbyEvents.publish({
                type: "LOBBY_CREATED",
                lobby: lobby!,
                lobbyId: lobby.id
            })

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
        try {
            const lobbyId = await this.uof.lobby!.getUserLobby(userId);

            if (!lobbyId) return;

            const result = await LobbyLua.disconnectUser({
                userId,
                lobbyId
            });

            if (result === 1) {
            await LobbyEvents.publish({
                type: "LOBBY_DELETED",
                lobbyId,
                lobby: null
            })}


            const lastTaskId = await redis.get(`index:lobby:${lobbyId}:lastTask`);

            if (lastTaskId) {
                const taskKey = `mm:task:${lastTaskId}`;

                // проверяем что задача существует
                const exists = await redis.exists(taskKey);

                if (exists) {
                    const status = await redis.hget(taskKey, "status");

                    // не перетираем уже выполненные задачи
                    if (status === "queued") {
                        await redis.hset(taskKey, "status", "cancelled");
                    }
                }
            }

            else{
            await LobbyEvents.publish({
                type: "LOBBY_UPDATED",
                lobbyId: lobbyId,
                lobby: null
            })}
            
        } catch (e) {
            console.error("Disconnect failed", e);
        }
    }

    public async handleLobbyLeaderLeaving(lobbyId: string, leavingUserId: string) {
        const lobby = await this.uof.lobby!.getLobby(lobbyId);
        if (!lobby) return;

        const remainingPlayers = lobby.users.filter(p => p !== leavingUserId);

        this.uof.redisCommand (async( multi) => {
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
                    multi.del(`lobby:${lobbyId}:inviteCode`);
                    multi.del(`invite:${lobby.inviteCode}`);

                    multi.srem("lobbies", lobbyId);
                }
            }
            await multi.exec()
        });
    }
}


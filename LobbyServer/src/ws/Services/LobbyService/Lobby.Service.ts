import { UserAlreadInLobbyException } from "../../Exceptions/UserAlreadyInLobbyException";
import { ILobbyRepository } from "./LobbyRepository/ILobbyRepository"
import crypto, { randomUUID } from "crypto";
import { UnitOfWork } from "../../../services/UnitOfWork/UnitOfWork";
import { redis, redisSub } from "../../../config/redis.config";
import { LobbyNotFoundException } from "../../Exceptions/LobbyNotFoundException";
import { LobbyFullException } from "../../Exceptions/LobbyFullException";
import { Lobby } from "../../types/Lobby";
import { Lobbyreposiory } from "./LobbyRepository/Imp/LobbyReposiotory.Redis";
import { ProfileService } from "../ProfileSirevice/ProfileService";
import { LobbyUser } from "../../types/LobbyUser";
import { lobbyStorage } from "./LobbyStorage/LobbyStorage";
import { LobbyLua } from "../../../redis/lobbyLua";
import { LobbyEvents } from "../NotifySustem/Events/LobbyEvents";
import { channel } from "diagnostics_channel";
import { LobbyEventBus } from "./LobbyEventBus";
import { LobbyEvent } from "../../types/LobbyEvent";

import { Notify } from "../NotifySustem/NotifySystem";
import { ClientManager } from "../../modules/ClientManager";
import { WSResponse } from "../../../types/WSResponse";
import { LobbyEventType, LobbyServerEvent } from "../../dto/LobbyServerEvent";
import { RequestJpinToLobbyMessageDto } from "../../dto/RequestJpinToLobbyMessageDto";
import { RedisScripts } from "../../../redis/scriptsLoader";
import { IEvent } from "../NotifySustem/Events/iEvent";

export class LobbyService{


    private clientMannager!:ClientManager;
    private lobbyrep:ILobbyRepository = new Lobbyreposiory();
    private eventBus: LobbyEventBus = new LobbyEventBus(redisSub)
    private uof = new UnitOfWork(redis);
    private lobyStorage = lobbyStorage
    private profileService = ProfileService;


    async init(clientMannager:ClientManager) {

        this.clientMannager = clientMannager;
        await this.lobyStorage.init();
        await this.eventBus.init(this.handleMessage.bind(this));
    }

    private async handleMessage(channel: string, message: string) {
        const event: LobbyEvent = JSON.parse(message);

        console.log(channel, "message: ", message);
        if (channel === "lobby_updates") {
            await this.handleUpdate(event);
        }

        if (channel === "lobby_runtime") {
            await this.handleRuntime(event);
        }
    }

    private async handleRuntime(event:LobbyEvent){

        const users = this.lobyStorage.get(event.lobbyId)?.users;
        console.log(event);
        switch (event.type){
            case "LOBBY_STATE_UPDATE":
                this.notifyUsersAboutLobbyStateUpdate(users!, event.state)
            break;

            case "LOBBY_HOST_CHANGED":
                this.notifyUsersAboutLobbyHostChanged(users!, event.newHostId)
            break;

            case "LOBBY_PLAYER_LEFT":
                this.notifyUsersAboutLobbyPlayerLeft(users!, event.userId)
            break;

            case "LOBBY_PLAYER_JOINED":
                this.notifyUsersAboutLobbyPlayerJoin(users!,event.lobbyId ,event.userId)
            break;
        }
    }

    private notifyUsersAboutLobbyPlayerLeft(users: string[], leftUserId:string){
        for(var user of users){
            const client = this.clientMannager?.get(user);

            const res: WSResponse = {
                code: 200,
                action: "Lobby_updates",
                data: {
                    type: "PLAYER_LEFT",
                    userId: leftUserId
                }
            }
            console.log(res);
            client?.ws.send(JSON.stringify(res))
        }
    }

    private async notifyUsersAboutLobbyPlayerJoin (users: string[], newLobbyId:string , joinedUserId:string){
        const JoindeUserProfile = await this.profileService.getProfile(joinedUserId)
        for(var user of users){
            const client = this.clientMannager?.get(user);

            let res: WSResponse;
            if(client?.userId == joinedUserId){
                const newLobby = await this.GetLobby(newLobbyId);
                res ={code: 200,
                    action: "Lobby_updates",
                    data: {
                        type: "NEW_LOBBY",
                        lobby: newLobby
                    }
                }
                console.log(res);
            }else{
                
                res = {
                    code: 200,
                    action: "Lobby_updates",
                    data: {
                        type: "PLAYER_JOIND",
                        profile: JoindeUserProfile
                    }
                }
            }
            console.log("client ",client?.userId ,res);
            client?.ws.send(JSON.stringify(res))
        }
    }

    private notifyUsersAboutLobbyHostChanged(users: string[], newHostId:string){
        for(var user of users){
            const client = this.clientMannager?.get(user);

            const res: WSResponse = {
                code: 200,
                action: "Lobby_updates",
                data: {
                    type: "NEW_HOST",
                    hostID: newHostId
                }
            }
            client?.ws.send(JSON.stringify(res))
        }
    }

    private notifyUsersAboutLobbyStateUpdate(users: string[], newState:string){
        for(var user of users){
            const client = this.clientMannager?.get(user);

            const res: WSResponse = {
                code: 200,
                action: "Lobby_updates",
                data: {
                    type: "STATE_UPDATE",
                    state: newState
                }
            }
            client?.ws.send(JSON.stringify(res))
        }
    }

    private async handleUpdate(event:LobbyEvent){
        if (!event.lobbyId) return;

        console.log("MessageFrom redis", event);

        switch (event.type) {
            case "LOBBY_CREATED":
                await this.handleLobbyCreated(event);
                break;

            case "LOBBY_UPDATED":
                await this.handleLobbyUpdated(event);
                break;

            case "LOBBY_DELETED":
                await this.handleLobbyDeleted(event);
                break;
        }
    }

    private async handleLobbyCreated(event: LobbyEvent) {

        await this.handleLobbyUpdated(event);
    }

    private async handleLobbyUpdated(event: LobbyEvent) {
        let lobby =
            event.lobby ??
            await this.lobbyrep.getLobby(event.lobbyId);

        if (!lobby) return;

        this.lobyStorage.set(event.lobbyId, lobby);

        event.lobby = lobby;

        Notify(event);
    }

    private async handleLobbyDeleted(event: LobbyEvent) {
        this.lobyStorage.delete(event.lobbyId)

        Notify(event);
    }


    public async NotifyRequestToJoin(LobbyID:string, PlayerID:string, requestID:string){
        const lobby = lobbyStorage.get(LobbyID);
        if(!lobby) return;

        if(lobby.isFull) return;

        const requestExist = redis.exists(`user:${PlayerID}:JoinRequests:${requestID}`)
        if(!requestExist) return;

        const client = this.clientMannager.get(lobby.host!);
        const Player = await this.profileService.getProfile(PlayerID);
        if(!Player) return;

        const sendMessage :WSResponse = {code:200, action: "requestToJoin", data:{profile: Player, requestId: requestID}} 
        client?.ws.send(JSON.stringify(sendMessage))
    }

    public async sendRequestToJoin(PlayerID:string, LobbyId:string){
        const Lobby = this.lobyStorage.get(LobbyId);
        if(!Lobby){
            throw new LobbyNotFoundException
        }

        if(Lobby.isFull){
            throw new LobbyFullException(LobbyId, Lobby.maxSize);
        }

        const hostId = Lobby.host;
        const userServer = await redis.get(`user:${hostId}:server`);

        const requestId = randomUUID();
        const payloadMessage: RequestJpinToLobbyMessageDto = {LobbyID: LobbyId, newUserId: PlayerID, requestID: requestId}
        const message: LobbyServerEvent = {eventType: LobbyEventType.REQUEST_TO_JOIN, payload:payloadMessage }

        await redis.set(`user:${PlayerID}:JoinRequests:${requestId}`, JSON.stringify(payloadMessage), "EX", 45)
        redis.publish(`LobbyServer:${userServer}`, JSON.stringify(message));
    }

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
        await this.uof.start();

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

    public async JoinToLobby_new(userId:string, requestId:string ,newLobbyId:string):Promise<void>{
        const raw = await redis.evalsha(
            RedisScripts.joinToOtherLobbySha,
            2,
            `lobby:${newLobbyId}`,
            `user:${userId}:JoinRequests:${requestId}`,
            userId,
            newLobbyId
        );

        if(!raw) return;

        const result = JSON.parse(raw as string);
        
        const runTime_events: LobbyEvent[] = [];
        const globalEvents_events: LobbyEvent[] = [];

        if(result.deletedLobby){
            globalEvents_events.push({
                type: "LOBBY_DELETED",
                lobbyId: result.oldLobbyId,
                lobby: null
            })
        }else{
            globalEvents_events.push({
                type: "LOBBY_UPDATED",
                lobbyId: result.oldLobbyId,
                lobby: null
            })

            runTime_events.push({
                type: "LOBBY_PLAYER_LEFT",
                lobby: null,
                lobbyId: result.oldLobbyId,
                userId: userId
            })

            if(result.newHost){
            runTime_events.push({
                type: "LOBBY_HOST_CHANGED",
                lobbyId: result.oldLobbyId,
                newHostId: result.newHost,
                lobby: null
            })
        }
        }
        globalEvents_events.push({
                type: "LOBBY_UPDATED",
                lobbyId: result.newLobbyId,
                lobby: null
        })

        runTime_events.push({
            type: "LOBBY_PLAYER_JOINED",
            lobby: null,
            lobbyId: result.newLobbyId,
            userId: userId
        })

        await Promise.all(globalEvents_events.map(e => LobbyEvents.publish(e)));
        await Promise.all(runTime_events.map(e => redis.publish("lobby_runtime", JSON.stringify(e))));
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

                        await redis.del(`index:lobby:${lobbyId}:lastTask`);
                    }
                }else{
                    await redis.del(`index:lobby:${lobbyId}:lastTask`);
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

const lobbyService = new LobbyService

export default lobbyService;
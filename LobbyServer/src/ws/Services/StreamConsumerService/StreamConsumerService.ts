import Redis from "ioredis"
import { ClientManager } from "../../modules/ClientManager";
import { WSResponse } from "../../../types/WSResponse";
import { LobbyEventType, LobbyServerEvent } from "../../dto/LobbyServerEvent";
import lobbyService from "../LobbyService/Lobby.Service";
import { RequestJpinToLobbyMessageDto } from "../../dto/RequestJpinToLobbyMessageDto";


export class StreamConsumerService{

    private readonly redisClinet: Redis;
    private readonly clientManager :ClientManager
 

    constructor(redisClient: Redis, clientManager: ClientManager){
        this.redisClinet = redisClient;
        this.clientManager = clientManager;
    }

    async startConsumer() {
        const channel_dispatcher = `DespatchNotification:${process.env.SERVER_ID}`;
        const Server_message = `LobbyServer:${process.env.SERVER_ID}`

        await this.redisClinet.subscribe(channel_dispatcher);
        await this.redisClinet.subscribe(Server_message);

        const handler = async (incomingChannel: string, data: string) => { 

            switch(incomingChannel){
                case channel_dispatcher:
                    this.handleDispatcher(data)
                    break;

                case Server_message:
                    this.handleLobbyMessages(data);
                    break;
            }
        };

        this.redisClinet.on("message", handler);
    }

    private handleLobbyMessages(data:string){
        try{
            const message: LobbyServerEvent = JSON.parse(data); 

            switch(message.eventType){
                case LobbyEventType.REQUEST_TO_JOIN:{
                    const payload: RequestJpinToLobbyMessageDto = message.payload;
                    lobbyService.NotifyRequestToJoin(payload.LobbyID, payload.newUserId, payload.requestID);
                    break;
                }
            }


        }catch(ex){
            console.log(ex);
        }
    }

    private handleDispatcher(data: string){
        let event;
        try {
            event = JSON.parse(data);
        } catch (e) {
            console.error("Invalid JSON in Redis message:", data);
            return;
        }

        if (!event?.users || !Array.isArray(event.users)) {
            console.warn("Invalid event format:", event);
            return;
        }

        const response: WSResponse = {
            code: 200,
            action: "sessionReady",
            data: event
        };

        const payload = JSON.stringify(response);

        console.log(event.users);
        for (const user of event.users) {
            console.log(user);
            const client = this.clientManager.get(user);


            if (!client?.ws) continue;

            try {
                console.log(payload);
                client.ws.send(payload);
            } catch (e) {
                console.error(`Failed to send to user ${user}`, e);
            }
        }
    }
}
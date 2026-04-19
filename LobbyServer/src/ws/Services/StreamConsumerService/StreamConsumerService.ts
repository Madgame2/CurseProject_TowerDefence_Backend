import Redis from "ioredis"
import { ClientManager } from "../../modules/ClientManager";
import { WSResponse } from "../../../types/WSResponse";


export class StreamConsumerService{

    private readonly redisClinet: Redis;
    private readonly clientManager :ClientManager
 

    constructor(redisClient: Redis, clientManager: ClientManager){
        this.redisClinet = redisClient;
        this.clientManager = clientManager;
    }

async startConsumer() {
    const channel = `DespatchNotification:${process.env.SERVER_ID}`;

    await this.redisClinet.subscribe(channel);

    const handler = async (incomingChannel: string, data: string) => { 
        if (incomingChannel !== channel) return;

        console.log(data);
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
    };

    this.redisClinet.on("message", handler);
}
}
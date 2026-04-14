import { redis } from "../../../../config/redis.config";
import { LobbyEvent } from "../../../types/LobbyEvent";
import { IEvent } from "./iEvent";

const CHANNEL = "lobby_updates";


export class LobbyEvents{
    static async publish(event: LobbyEvent) {
        await redis.publish(CHANNEL, JSON.stringify(event));
    }
}
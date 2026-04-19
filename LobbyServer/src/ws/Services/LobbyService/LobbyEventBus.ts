import Redis from "ioredis";

export class LobbyEventBus {
    constructor(private sub: Redis) {}

    async init(handler: (channel: string, msg: string) => void) {
        await this.sub.subscribe("lobby_updates");
        await this.sub.subscribe("lobby_runtime");

        this.sub.on("message", handler);
    }
}
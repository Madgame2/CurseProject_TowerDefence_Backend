import { Injectable } from "@nestjs/common";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";

@Injectable()
export class SessionNotifier {
    constructor(private registry: ClientRegistryService) {}

    send(playerId: string, msg: any) {
        const client = this.registry.getClient(playerId);
        client?.ctx.ws.send(msg);
    }

    broadcast(playerIds: string[], msg: any) {
        for (const id of playerIds) {
            this.send(id, msg);
        }
    }
}
import { Injectable } from "@nestjs/common";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { ClientConnection } from "src/ws/Types/ClientConnection";
import { SessionRegistry } from "../SessionRegistryModule/SessionRegistry";
import { Vector3 } from "src/types/Vector3";

@Injectable()
export class PlayerEventBinder {

    constructor(private readonly clients: ClientRegistryService ){}


    bindAll(players:Iterable<string>) {
        for (const player of players) {
            const client = this.clients.getClient(player);

            if(client) this.bind(client);
        }
    }

    bind(player: ClientConnection) {

        const router = player.router;

        router.onRpc("MoveTo", (ctx) => {
            const payload = ctx.message?.payload;

            const target: Vector3 = new Vector3(payload.X, 0, payload.Z);

            player.session.world.movementService.setMoveTarget(
                ctx.userId!,
                target
            );
        });
    }
}
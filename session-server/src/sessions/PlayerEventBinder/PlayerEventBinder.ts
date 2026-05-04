import { Injectable } from "@nestjs/common";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { ClientConnection } from "src/ws/Types/ClientConnection";
import { SessionRegistry } from "../SessionRegistryModule/SessionRegistry";
import { Vector3 } from "src/types/Vector3";
import { RequestForBuilding } from "src/types/RequestForBuilding";
import { Vector2 } from "src/types/Vector2";
import { PlayerStates } from "../World/Entities/Player";




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
            const playerWorldObj = player.session.world.getPlayer(ctx.userId!);
            const target: Vector3 = new Vector3(payload.X, 0, payload.Z);

            if(playerWorldObj!.state == PlayerStates.BLOCKED_ADN_HIDE) return;

            player.session.world.movementService.setMoveTarget(
                ctx.userId!,
                target
            );
            playerWorldObj!.state = PlayerStates.RUNING;
        });

        router.on("BuildObject", (message)=>{
            const payload = message.payload;
            const ctx = player.ctx;

            console.log("BuildObject EVENT");
            console.log(payload);
            if (!payload) return;

            const data: RequestForBuilding = typeof payload === "string"
                    ? JSON.parse(payload)
                    : payload;
            
            console.log(data);
            const playerWorldObj = player.session.world.getPlayer(ctx.userId!);
            const worldPos: Vector2 = new Vector2(data.worldX, data.worldZ)
            playerWorldObj?.eventAgent.StartBuildingEvent(worldPos,data.buildNetID)
            //player.session.world.builderSystem.PreperForBuilding(ctx.userId!, worldPos, data.buildNetID)
        })
    }
}
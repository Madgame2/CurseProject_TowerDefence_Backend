import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";

export class MovementService {

    constructor(private world: World) {}

    setMoveTarget(playerId: string, target: Vector3) {
        console.log(playerId);
        const player = this.world.getPlayer(playerId);
        console.log(player);
        if (!player) return;

        player.moveIntent = target;

        console.log(player);
    }
}
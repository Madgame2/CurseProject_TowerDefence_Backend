import { Vector2 } from "src/types/Vector2";
import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";

export class MovementService {

    constructor(private world: World) {}

    setMoveTarget(playerId: string, target: Vector3) {
        const player = this.world.getPlayer(playerId);
        if (!player) return;

        player.navAgent.setTarget(new Vector2(target.x, target.z));
        player.moveIntent = target;
    }
}
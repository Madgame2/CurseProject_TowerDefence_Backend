import { Injectable } from "@nestjs/common";
import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";
import { PlayerStates } from "../Entities/Player";


export class WorldSimulationService{

    constructor(private world: World){}

    tick(delta: number) {

        this.updateMovement(delta);

    }

    updateMovement(delta: number) {
for (const player of this.world.getAllPlayers()) {

    console.log(player);
    if (!player.moveIntent) continue;

    const toTarget = Vector3.subtract(player.moveIntent, player.position);
    const distance = toTarget.length();

    const moveDistance = player.speed * delta;

    // 🔥 ВОТ КЛЮЧЕВАЯ ЧАСТЬ
    if (moveDistance >= distance) {
        // дошли до точки
        player.position = player.moveIntent;
        player.velocity = Vector3.zero();
        player.direction = Vector3.zero();
        player.state = PlayerStates.IDEL;
        player.moveIntent = null;
        continue;
    }

    const direction = Vector3.normalize(toTarget);
    const velocity = direction.multiply(player.speed);

    player.direction = direction;
    player.velocity = velocity;
    player.state = PlayerStates.RUNING;
    const angleY = Math.atan2(direction.x, direction.z) * (180 / Math.PI);

    player.rotation = new Vector3(0,angleY,0 )
    player.position = Vector3.add(
        player.position,
        Vector3.multiply(direction, moveDistance)
    );
}
        }
}   
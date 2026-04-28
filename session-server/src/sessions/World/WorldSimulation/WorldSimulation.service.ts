import { Injectable } from "@nestjs/common";
import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";


export class WorldSimulationService{

    constructor(private world: World){}

    tick(delta: number) {

        this.updateMovement(delta);

    }

    updateMovement(delta: number) {
    for (const player of this.world.getAllPlayers()) {

        if (!player.moveIntent) continue;

        const direction = Vector3.normalize(
            Vector3.subtract(player.moveIntent, player.position)
        );

        player.position = Vector3.add(
            player.position,
            Vector3.multiply(direction, player.speed * delta)
        );
    }
}
}   
import { Injectable } from "@nestjs/common";
import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";
import { PlayerStates } from "../Entities/Player";
import { Vector2 } from "src/types/Vector2";


export class WorldSimulationService{

    constructor(private world: World){}

    tick(delta: number) {
        this.updateMovement(delta);
        this.updateEntities(delta);
    }

    updateEntities(delta:number){
        for(const entity of this.world.getAllEnity()){
            console.log("ОБНОВИЛ СУЩНОСТИ");
            entity.update(delta);
        }
    }

    updateMovement(delta: number) {
            for (const player of this.world.getAllPlayers()) {
                console.log("ОБНОВИЛ ДВИЖЕНИЕ");
                if(player.state == PlayerStates.BLOCKED_ADN_HIDE) continue;

                const agent = player.navAgent;

                // 🔥 пересчёт пути если нужно
                const dir = agent.update( new Vector2(player.position.x, player.position.z));

                if (!dir) {
                    player.velocity = Vector3.zero();
                    player.direction = Vector3.zero();
                    player.state = PlayerStates.IDEL;
                    continue;
                }

                const direction = new Vector3(dir!.x, 0, dir!.y);
                const moveDistance = player.speed * delta;

                const targetPoint2D = agent.path![agent.curentIndex!];
                const targetPoint = new Vector3(targetPoint2D.x, 0, targetPoint2D.y);

                const toTarget = Vector3.subtract(targetPoint, player.position);
                const distance = toTarget.length();

                if (moveDistance >= distance) {
                    player.position = targetPoint;

                    // переключение точки
                    agent.curentIndex!++;

                    if (agent.curentIndex! >= agent.path!.length) {
                        agent.path = undefined;
                        player.velocity = Vector3.zero();
                        player.direction = Vector3.zero();
                        player.state = PlayerStates.IDEL;
                        continue;
                    }
                }

                const velocity = direction.multiply(player.speed);

                player.direction = direction;
                player.velocity = velocity;

                const angleY = Math.atan2(direction.x, direction.z) * (180 / Math.PI);
                player.rotation = new Vector3(0, angleY, 0);

                //console.log(player);
                player.position = Vector3.add(
                    player.position,
                    Vector3.multiply(direction, moveDistance)
                );
            }
        }
}   
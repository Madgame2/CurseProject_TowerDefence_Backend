import { Injectable } from "@nestjs/common";
import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";
import { Player, PlayerStates } from "../Entities/Player";
import { Vector2 } from "src/types/Vector2";
import { INpc } from "../npc/INpc";


export class WorldSimulationService{

    constructor(private world: World){}

    private repathQueue: INpc[] = [];
    private repathSet = new Set<INpc>();

    tick(delta: number) {
        this.updateWorldSpawnService(delta)
        this.updateDirecror(delta)

        this.updateMovement(delta);

        this.processImmediateRepath();

        this.updateNpcAI(delta);
        this.updateEntities(delta);
    }

    processImmediateRepath() {

        for(const player of this.world.getAllPlayers()){
            if(!player.navAgent.needsRepath) continue;

            player.navAgent.recalculatePath({x: player.position.x, y: player.position.z} as Vector2);
            player.navAgent.needsRepath = false;
        }

        for (const npc of this.world.getAllNpc()) {

            if (!npc.navAgent.needsRepath) continue;

            npc.navAgent.recalculatePath(npc.position);
            npc.navAgent.needsRepath = false;
        }
    }

    updateNpcAI(delta:number){
        for(const npc of this.world.getAllNpc()){
            npc.action(delta);
        }
    }
    updateWorldSpawnService(delta: number){
        this.world.waveSpawner.udate(delta);
    }

    updateDirecror(delta:number){
        this.world.directorSystem.Update(delta);
    }

    updateEntities(delta:number){
        for(const entity of this.world.getAllEnity()){
            entity.update(delta);
        }
    }

    updateMovement(delta: number) {

        for (const player of this.world.getAllPlayers()) {

            if (player.state === PlayerStates.BLOCKED_ADN_HIDE) {
                continue;
            }

            // ВАЖНО:
            // создаём ОДИН объект позиции
            const current2D = new Vector2(
                player.position.x,
                player.position.z
            );

            const moveDistance = player.speed * delta;

            const direction2D = player.navAgent.update(
                current2D,
                moveDistance
            );

            // =====================================================
            // SNAP ПОЗИЦИИ ИЗ NAV AGENT
            // =====================================================
            player.position.x = current2D.x;
            player.position.z = current2D.y;

            // пути нет
            if (!direction2D) {

                this.stopPlayer(player);
                continue;
            }

            const direction = new Vector3(
                direction2D.x,
                0,
                direction2D.y
            );

            const velocity = direction.multiply(player.speed);

            player.direction = direction;
            player.velocity = velocity;

            // rotation
            player.rotation = new Vector3(
                0,
                Math.atan2(direction.x, direction.z) * (180 / Math.PI),
                0
            );

            // movement
            player.position = Vector3.add(
                player.position,
                velocity.multiply(delta)
            );
        }
    }
private stopPlayer(player: Player) {

    player.velocity = Vector3.zero();
    player.direction = Vector3.zero();

    //console.log("Я стал IDEL");
    //player.state = PlayerStates.IDEL;

}
}   
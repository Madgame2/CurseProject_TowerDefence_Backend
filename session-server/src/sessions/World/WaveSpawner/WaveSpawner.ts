import { delay } from "rxjs";
import { NpcFactory } from "../npc/Factory/NpcFactory";
import { WaveConfig } from "./WaveConfig";
import { NpcTypes } from "../npc/NpcTypes.enum";
import { BehaviorTypes } from "../npc/BehaviorTypes.enum";
import { Vector2 } from "src/types/Vector2";
import { World } from "../Entities/World";


interface SpawnTask {
    type: NpcTypes;
    pos: Vector2;
}

export class WaveSpawner {

    private queue: SpawnTask[] = [];

    private timer: number = 0;

    private spawnDelay: number = 0;

    constructor(
        private npcFactory: NpcFactory,
        private world: World
    ) {}


    startWave(config: WaveConfig){

        this.queue = [];
        this.spawnDelay = config.spawnDelay;

        for(let enemy of config.enemies){
                this.queue.push({
                    type: enemy.type,
                    pos: enemy.position
                });
        }
    }


    udate(delta: number){

        if (this.queue.length === 0) {
            return;
        }

        this.timer -= delta;

        if (this.timer > 0) {
            return;
        }


        const task = this.queue.shift();
        if (!task) {
            return;
        }

        this.spawnEnemy(task.type, task.pos);

        this.timer += this.spawnDelay;
    }

    private spawnEnemy(type: NpcTypes, pos: Vector2) {

        const npc = this.npcFactory.create(
            type,
            BehaviorTypes.ENEMY
        );
        npc.position = pos;

        this.world.addNpc(npc);
        console.log("Spawned", npc);
    }
}
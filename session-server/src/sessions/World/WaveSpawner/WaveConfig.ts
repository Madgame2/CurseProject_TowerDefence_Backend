import { Vector2 } from "src/types/Vector2";
import { NpcTypes } from "../npc/NpcTypes.enum";


export interface EnemySpawnData {
    type: NpcTypes;
    position: Vector2;
}

export interface WaveConfig {
    enemies: EnemySpawnData[];
    spawnDelay: number;
}
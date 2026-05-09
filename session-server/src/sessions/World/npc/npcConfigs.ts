import { NpcTypes } from "./NpcTypes.enum";
import { NpcConfig } from "./NpcConfig";


export const npcConfigs: Record<NpcTypes, NpcConfig> = {
    [NpcTypes.SKELETON]: {
        hp: 50,
        damage: 1,
        attackRange: 0.5,
        attackCooldown: 1,
        speed: 0.5
    },
    [NpcTypes.KNIGHT]: {
        hp: 120,
        damage: 25,
        attackRange: 0.5,
        attackCooldown: 1,
        speed: 1
    }
};
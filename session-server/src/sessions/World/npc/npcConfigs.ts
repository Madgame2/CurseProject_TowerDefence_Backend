import { NpcTypes } from "./NpcTypes.enum";
import { NpcConfig } from "./NpcConfig";


export const npcConfigs: Record<NpcTypes, NpcConfig> = {
    [NpcTypes.SKELETON]: {
        hp: 50,
        damage: 1,
        attackRange: 0.5,
        notifyRange: 1,
        attackCooldown: 1,
        runMultiplier:1,
        speed: 0.5
    },
    [NpcTypes.KNIGHT]: {
        hp: 120,
        damage: 15,
        attackRange: 0.75,
        notifyRange: 20,
        attackCooldown: 7,
        runMultiplier: 2,
        speed: 1
    }
};
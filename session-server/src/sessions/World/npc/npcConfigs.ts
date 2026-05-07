import { NpcTypes } from "./NpcTypes.enum";
import { NpcConfig } from "./NpcConfig";


export const npcConfigs: Record<NpcTypes, NpcConfig> = {
    [NpcTypes.SKELETON]: {
        hp: 50,
        damage: 10,
        speed: 2
    },
    [NpcTypes.KNIGHT]: {
        hp: 120,
        damage: 25,
        speed: 1
    }
};
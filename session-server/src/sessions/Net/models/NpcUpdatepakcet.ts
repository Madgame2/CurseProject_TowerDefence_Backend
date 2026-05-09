import { NpcTypes } from "src/sessions/World/npc/NpcTypes.enum";
import { IWorldUpdateState } from "./IWordlUpdateState";


export enum NpcEventType{
    SPAWN = "SPAWN",
    TERMINATE = "TERMINATE",
    UPDATE = "UPDATE"
}

export enum DataType{
    NPC_STATE = "NPC_STATE",
    ACTION = "ACTION"
}


export interface NpcUpdatePacket extends IWorldUpdateState{
    type: "Npc";
    npcId: string;
    enventType: NpcEventType;
    npcType: NpcTypes
    data: any;
}
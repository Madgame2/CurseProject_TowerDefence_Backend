import { Vector2 } from "src/types/Vector2";
import { IWorldUpdateState } from "./IWordlUpdateState";
import { EntityesEnum } from "src/sessions/World/EntitiesSystem/EntityesEnum";



export enum EntityEventType{
    SPAWN = "SPAWN",
    TERMINATE = "TERMINATE"
}

export interface EnityEvent extends IWorldUpdateState{
    type: "Entity";
    enityId: string;
    enventType: EntityEventType;
    enityType: EntityesEnum
    data: any;
}
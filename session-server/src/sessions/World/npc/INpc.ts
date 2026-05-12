import { NpcTypes } from "./NpcTypes.enum";
import { NpcConfig } from "./NpcConfig";
import { BehaviorTypes } from "./BehaviorTypes.enum";
import { Vector2 } from "src/types/Vector2";
import { Vector3 } from "src/types/Vector3";
import { NavAgent } from "../NavSystem/NavAgent";
import { INpcBehavior } from "./INpcBehavior";



export enum NpcActions{
    ATTACK = "ATTACK"
}



export interface INpc{
    id:string;
    type:NpcTypes;
    behaverType: BehaviorTypes;

    config: NpcConfig;
    radius: number;

    position: Vector2
    velocity:Vector2
    direction:Vector2
    rotation:Vector3
    
    navAgent:NavAgent

    action(delta:number):void;
    getState();

    getBehavior(): INpcBehavior;

    lookAt(pos:Vector2);
}
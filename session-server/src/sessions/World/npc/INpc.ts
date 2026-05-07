import { NpcTypes } from "./NpcTypes.enum";
import { NpcConfig } from "./NpcConfig";
import { BehaviorTypes } from "./BehaviorTypes.enum";

export interface INpc{
    id:string;
    type:NpcTypes;
    behaverType: BehaviorTypes;

    config: NpcConfig;

    
    action(delta:number):void;
    getState();
}
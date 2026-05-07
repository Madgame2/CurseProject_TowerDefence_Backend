import { INpc } from "./INpc";
import { NpcTypes } from "./NpcTypes.enum";
import { INpcBehavior } from "./INpcBehavior";
import { NpcConfig } from "./NpcConfig";
import { BehaviorTypes } from "./BehaviorTypes.enum";

export class Npc implements INpc{

    public id: string;
    public type: NpcTypes;
    public config: NpcConfig;
    public behaverType: BehaviorTypes;

    private behavior: INpcBehavior;
    
    private currentHp: number;

    constructor(
        id: string,
        type: NpcTypes,
        config: NpcConfig,
        behaviorType: BehaviorTypes,
        behavior: INpcBehavior
    ) {
        this.id = id;
        this.type = type;
        this.config = config;
        this.behavior = behavior;
        this.behaverType = behaviorType

        this.currentHp = config.hp;
    }

    action(delta: number): void {
        this.behavior.update(this, delta);
    }

    getState(): string {
        return this.behavior.getState();
    }
}
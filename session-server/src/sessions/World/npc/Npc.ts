import { INpc } from "./INpc";
import { NpcTypes } from "./NpcTypes.enum";
import { INpcBehavior } from "./INpcBehavior";
import { NpcConfig } from "./NpcConfig";
import { BehaviorTypes } from "./BehaviorTypes.enum";
import { Vector2 } from "src/types/Vector2";
import { Vector3 } from "src/types/Vector3";
import { NavAgent } from "../NavSystem/NavAgent";

export class Npc implements INpc{

    public id: string;
    public type: NpcTypes;
    public config: NpcConfig;
    public behaverType: BehaviorTypes;

    private behavior: INpcBehavior;
    
    private currentHp: number;

    position: Vector2;
    velocity: Vector2;
    rotation: Vector3;
    direction: Vector2;
    navAgent: NavAgent;

    constructor(
        id: string,
        type: NpcTypes,
        config: NpcConfig,
        behaviorType: BehaviorTypes,
        behavior: INpcBehavior,
        navAgent: NavAgent
    ) {
        this.id = id;
        this.type = type;
        this.config = config;
        this.behavior = behavior;
        this.behaverType = behaviorType;
        this.navAgent = navAgent;

        this.currentHp = config.hp;

        this.position = Vector2.zero();
        this.velocity = Vector2.zero();
        this.rotation = Vector3.zero();
        this.direction = Vector2.zero();
    }

    action(delta: number): void {
        this.behavior.update(this, delta);
    }

    getState(): string {
        return this.behavior.getState();
    }
}
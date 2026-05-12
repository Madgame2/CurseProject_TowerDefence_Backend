import { INpc } from "./INpc";
import { NpcTypes } from "./NpcTypes.enum";
import { INpcBehavior } from "./INpcBehavior";
import { NpcConfig } from "./NpcConfig";
import { BehaviorTypes } from "./BehaviorTypes.enum";
import { Vector2 } from "src/types/Vector2";
import { Vector3 } from "src/types/Vector3";
import { NavAgent } from "../NavSystem/NavAgent";
import { IAttackable } from "../EntitiesSystem/IAttackable";

export class Npc implements INpc, IAttackable{

    private deathListeners: (() => void)[] = [];
    
    public id: string;
    public type: NpcTypes;
    public config: NpcConfig;
    public behaverType: BehaviorTypes;

    private behavior: INpcBehavior;

    radius: number = 0.5;
    max_hp: number;
    current_hp: number;

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

        this.max_hp = config.hp;
        this.current_hp = config.hp;

        this.position = Vector2.zero();
        this.velocity = Vector2.zero();
        this.rotation = Vector3.zero();
        this.direction = Vector2.zero();
    }

    takeDamage(amount: number): void {
        this.current_hp -= amount;

        if (this.current_hp <= 0) {
            this.current_hp = 0;
            this.die();
        }
    }

    subscribeDeath(cb: () => void): void {
        this.deathListeners.push(cb);
    }

    unsubscribeDeath(cb: () => void): void {
        this.deathListeners = this.deathListeners.filter(x => x !== cb);
    }

    lookAt(target: Vector2): number {

        const dir = Vector2.subtract(target, this.position);

        const angle = Math.atan2(dir.y, dir.x);

        return angle;
    }

    private die() {
        for (const cb of this.deathListeners) {
            cb();
        }

        this.deathListeners = [];
    }

    getBehavior(): INpcBehavior {
        return this.behavior;
    }

    action(delta: number): void {
        this.behavior.update(this, delta);
    }

    getState(): string {
        return this.behavior.getState();
    }
}
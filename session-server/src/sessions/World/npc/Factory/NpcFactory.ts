import { NpcTypes } from "../NpcTypes.enum";
import { BehaviorTypes } from "../BehaviorTypes.enum";
import { INpc } from "../INpc";
import { randomUUID } from "crypto";
import { npcConfigs } from "../npcConfigs";
import { INpcBehavior } from "../INpcBehavior";
import { EnemyBehavior } from "../Behaviors/Enemy.behavior";
import { Npc } from "../Npc";


export class NpcFactory{
 
    create(type: NpcTypes, behaviorType: BehaviorTypes): INpc {

        const id = randomUUID();
        const config = npcConfigs[type];
        const behavior = this.createBehavior(behaviorType);

        return new Npc(
            id,
            type,
            config,
            behaviorType,
            behavior
        );
    }

    private createBehavior(type: BehaviorTypes): INpcBehavior {
        switch (type) {
            case BehaviorTypes.ENEMY:
                return new EnemyBehavior();

            case BehaviorTypes.NEITRALL:
                //return new NeutralBehavior();

            case BehaviorTypes.GUARDION:
                //return new GuardianBehavior();

            default:
                throw new Error("Unknown behavior");
        }
    }
}
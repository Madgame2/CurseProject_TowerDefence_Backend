import { NpcTypes } from "../NpcTypes.enum";
import { BehaviorTypes } from "../BehaviorTypes.enum";
import { INpc } from "../INpc";
import { randomUUID } from "crypto";
import { npcConfigs } from "../npcConfigs";
import { INpcBehavior } from "../INpcBehavior";
import { EnemyBehavior } from "../Behaviors/Enemy.behavior";
import { Npc } from "../Npc";
import { NavAgent } from "../../NavSystem/NavAgent";
import { PathfindingService } from "../../NavSystem/PathfindingService";
import { WorldQuery } from "../../worldQuery/WorldQuery";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";
import { GuardianBehavior } from "../Behaviors/GuardianBehavior";


export class NpcFactory{
 
    constructor(private pathFindingService: PathfindingService,
         private worldQwery: WorldQuery,
        private eventBus: WorldUpdatesStorage){}
    create(type: NpcTypes, behaviorType: BehaviorTypes): INpc {

        const id = randomUUID();
        const config = npcConfigs[type];
        const navAgent = new NavAgent(this.pathFindingService);
        const behavior = this.createBehavior(behaviorType);

        return new Npc(
            id,
            type,
            config,
            behaviorType,
            behavior,
            navAgent
        );
    }

    private createBehavior(type: BehaviorTypes): INpcBehavior {
        switch (type) {
            case BehaviorTypes.ENEMY:
                
                return new EnemyBehavior(this.worldQwery,this.eventBus);

            case BehaviorTypes.NEITRALL:
                //return new NeutralBehavior();

            case BehaviorTypes.GUARDION:
                return new GuardianBehavior(this.worldQwery);

            default:
                throw new Error("Unknown behavior");
        }
    }
}
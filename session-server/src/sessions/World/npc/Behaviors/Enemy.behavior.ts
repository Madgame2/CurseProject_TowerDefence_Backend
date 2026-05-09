import { Vector2 } from "src/types/Vector2";
import { NavAgent } from "../../NavSystem/NavAgent";
import { INpc } from "../INpc";
import { INpcBehavior } from "../INpcBehavior";
import { Vector3 } from "src/types/Vector3";
import { IInteractable } from "../../EntitiesSystem/IInteractable";
import { WorldQuery } from "../../worldQuery/WorldQuery";

export class EnemyBehavior implements INpcBehavior{
    
    private  targetSelected:boolean = false

    constructor(private worldQwert: WorldQuery){}
    
    update(npc: INpc, delta: number): void {

        if (!this.targetSelected) {
            const rootObj = this.worldQwert.getRootHouseObj();
            this.SetTarget(npc,rootObj);
        }

        const direction = npc.navAgent.update(npc.position);

        if (!direction) {
            this.stop(npc);
            return;
        }

        this.move(npc, direction, delta);
    }

    private SetTarget(npc: INpc,target:IInteractable ){

        const points = target.getInteractionPoints();
        if(!points) return;

        let closest = points[0];
        let closestDist = Infinity;

        for (const point of points) {

            const dist = Vector2.distance(
                npc.position,
                point
            );

            if (dist < closestDist) {
                closest = point;
                closestDist = dist;
            }
        }

        npc.navAgent.setTarget(closest);
        this.targetSelected = true;
    }

    private move(
        npc: INpc,
        direction: Vector2,
        delta: number
    ) {

        const moveDistance = npc.config.speed * delta;

        npc.direction = direction;

        npc.velocity = direction.multiply(npc.config.speed);

        npc.position = Vector2.add(
            npc.position,
            direction.multiply(moveDistance)
        );

        npc.rotation = new Vector3(
            0,
            Math.atan2(direction.x, direction.y) * (180 / Math.PI),
            0
        );
    }

    private stop(npc: INpc) {

        npc.velocity = Vector2.zero();
        npc.direction = Vector2.zero();
    }


    getState(): string {
        return ""
    }
}
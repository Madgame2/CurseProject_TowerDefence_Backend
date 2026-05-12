import { Vector2 } from "src/types/Vector2";
import { NavAgent } from "../../NavSystem/NavAgent";
import { INpc, NpcActions } from "../INpc";
import { INpcBehavior } from "../INpcBehavior";
import { Vector3 } from "src/types/Vector3";
import { IInteractable } from "../../EntitiesSystem/IInteractable";
import { WorldQuery } from "../../worldQuery/WorldQuery";
import { StructureEntity, StructureEntityWithHP } from "../../Structures/StructureEntity";
import { IEntity } from "../../EntitiesSystem/IEntity";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";
import { DataType, NpcEventType, NpcUpdatePacket } from "src/sessions/Net/models/NpcUpdatepakcet";
import { EnityEvent, EntityEventType } from "src/sessions/Net/models/EnityState";
import { IAttackable } from "../../EntitiesSystem/IAttackable";


function isInteractable(obj: any): obj is IInteractable {
    return typeof obj?.getInteractionPoints === "function";
}

function isAttackable(obj: any): obj is IAttackable {
    return obj && typeof obj.current_hp === "number" && typeof obj.takeDamage === "function";
}

export class EnemyBehavior implements INpcBehavior{
    
    private  targetSelected:boolean = false
    private target:StructureEntity | IEntity | null = null 

    private attackTimer = 0;

    constructor(private worldQwert: WorldQuery, private eventBus: WorldUpdatesStorage){}
    
    update(npc: INpc, delta: number): void {

        if (!this.targetSelected) {
            const rootObj = this.worldQwert.getRootHouseObj();
            this.SetTarget(npc, rootObj);
        }

        if (this.target == null) return;

        if (!this.target || !isInteractable(this.target)) return;

        const interactionPoints = this.target.getInteractionPoints();

        if (!interactionPoints || interactionPoints.length === 0)
            return;

        let inInteractZone = false;

        for (const point of interactionPoints) {

            const distance = Vector2.distance(npc.position, point);
            console.log(distance, " nead: ", npc.config.attackRange+0.5)
            if (distance <= npc.config.attackRange+0.5) {
                console.log("МОГУ БИТЬ, ", npc.id);
                inInteractZone = true;
                npc.navAgent.stop();
            }
        }

        // NPC находится в зоне взаимодействия
        //console.log("inInteractZone: ",inInteractZone);
        if (inInteractZone) {

            this.stop(npc);

            this.attackTimer -= delta;

            if (this.attackTimer <= 0) {

                this.attackTimer = npc.config.attackCooldown;
                console.log("АТТАКУЮ ", npc.id);
                this.attack(npc, this.target);
            }

            return;
        }

        const moveDistance = npc.config.speed * delta;

        const direction = npc.navAgent.update(
            npc.position,
            moveDistance
        );

        if (!direction) {
            this.stop(npc);
            return;
        }

        this.move(npc, direction, delta);
    }

    attack(npc: INpc, target: StructureEntity | IEntity) {

        if (!isAttackable(target)) return;

        const updatePacket: NpcUpdatePacket = {
            type: "Npc",
            enventType: NpcEventType.UPDATE,
            npcId: npc.id,
            npcType: npc.type,
            data: {
                dataType: DataType.ACTION,
                action: NpcActions.ATTACK
            }
        };

        this.eventBus.add(updatePacket);

        target.takeDamage(npc.config.damage);
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

        console.log("БУДУ БИТЬ В: ", closest)
        npc.navAgent.setTarget(closest);
        this.targetSelected = true;

        this.target = target as StructureEntityWithHP;
    }

 

private move(
    npc: INpc,
    direction: Vector2,
    delta: number
) {

    const moveDistance = npc.config.speed * delta;

    npc.direction = direction;

    npc.velocity = direction.multiply(npc.config.speed);

    // ДВИЖЕНИЕ
    npc.position.x += direction.x * moveDistance;
    npc.position.y += direction.y * moveDistance;

    // ROTATION
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
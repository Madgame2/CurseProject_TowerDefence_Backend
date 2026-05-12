import { INpc } from "src/sessions/World/npc/INpc";
import { EntityesEnum } from "../../EntityesEnum";
import { EntityState } from "../../EntityState";
import { IEntity } from "../../IEntity";
import { Vector2 } from "src/types/Vector2";
import { WorldQuery } from "src/sessions/World/worldQuery/WorldQuery";
import { BehaviorTypes } from "src/sessions/World/npc/BehaviorTypes.enum";
import { IAttackable } from "../../IAttackable";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";
import { EnityEvent, EntityEventType } from "src/sessions/Net/models/EnityState";

function isAttackable(entity: any): entity is IAttackable {
    return !!entity
        && typeof entity === "object"
        && typeof entity.takeDamage === "function"
        && typeof entity.unsubscribeDeath === "function"
        && typeof entity.subscribeDeath === "function"
        && typeof entity.current_hp === "number"
        && typeof entity.max_hp === "number";
}

enum UpdateTypes{
    ACTION = "ACTION"
}

enum ActionTypes{
    SHOOT = "SHOOT",
    SET_TARGET = "SET_TARGET"
}

export class GrossCannon implements IEntity{
    Id:string
    linkedPalyer: string
    position: Vector2
    type: EntityesEnum = EntityesEnum.GrossCannon;

    private target: INpc | null = null;
    private attackCooldown = 0;

    private readonly range = 6;
    private readonly fireRate = 3.2; // секунд

    private readonly damage: number = 20;

    private worldQuery: WorldQuery;
    private eventBuss: WorldUpdatesStorage;

    private targetDeathCallback = () => {};

    constructor(id:string, linkedplayer:string, WorldPos: Vector2,
         worldQuery: WorldQuery,
         eventBuss: WorldUpdatesStorage){
            this.Id = id;
            this.linkedPalyer = linkedplayer;

    
            this.position = WorldPos;

            this.worldQuery = worldQuery;
            this.eventBuss =eventBuss;
    }

    update(delta: number) {

        const targetValid = this.isTargetValid();

        if (!targetValid && this.target !== null) {
            this.clearTarget();   
        }

        if (!this.target) {
            this.acquireTarget();
        }

        this.tryShoot(delta);
    }

    private updateCooldown(delta: number) {
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    }

    private isTargetValid(): boolean {
        if (!this.target) return false;

        const dist = Vector2.distance(this.position, this.target.position);

        return dist <= this.range;
    }

    private clearTarget() {
        this.unsubscribeFromTarget();

        this.target = null;

        this.emitTargetUpdate(null);
    }

    private emitTargetUpdate(target: INpc | null) {

        const eventPacket: EnityEvent = {
            type: "Entity",
            enityId: this.Id,
            enityType: this.type,
            enventType: EntityEventType.UPDATE,
            data: {
                updateType: UpdateTypes.ACTION,
                data: {
                    type: ActionTypes.SET_TARGET,
                    data:{
                        target: target ? target.id : null
                    }
                }
            }
        };

        this.eventBuss.add(eventPacket);
    }


    private acquireTarget() {
        const target = this.getTarget();

        if (!target) return;

        this.target = target;
        if (isAttackable(target)) {

            // если уже была подписка — не забываем удалить
            this.unsubscribeFromTarget();

            this.targetDeathCallback = this.handleTargetDeath.bind(this);

            target.subscribeDeath(this.targetDeathCallback);
        }

        this.emitTargetUpdate(target);
    }

    private handleTargetDeath = () => {
        this.clearTarget();
    };

    private unsubscribeFromTarget() {
        if (!this.target) return;

        if (isAttackable(this.target)) {
            this.target.unsubscribeDeath(this.targetDeathCallback);
        }
    }

    

    private tryShoot(delta: number) {
        if (this.target == null) return;
        if (this.attackCooldown > 0) {
            this.updateCooldown(delta);
            return;
        }

        if (isAttackable(this.target) && this.target.current_hp <= 0) {
            console.log("ОЧИШАЮ ЦЕЛЬ")
            this.clearTarget();
            return;
        }
        this.shoot(this.target);
        this.attackCooldown = this.fireRate;
    }

    private getTarget(){
        const enemies = this.worldQuery.getNPCsByBehavior(
                this.position,
                this.range,
                BehaviorTypes.ENEMY
            );

        if (enemies.length > 0) {
            return this.getClosest(enemies);
        }

        return null;
    }

    private getClosest(enemies: INpc[]): INpc {
        let closest = enemies[0];
        let minDist = Vector2.distance(this.position, closest.position);

        for (const enemy of enemies) {

            if (!isAttackable(enemy)) continue;

            const dist = Vector2.distance(this.position, enemy.position);

            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        }

        return closest;
    }

    private shoot(target: INpc) {
        if(!isAttackable(target)){
            return;
        }


        console.log(`Башня стреляет в ${target.id}`);
        target.takeDamage(this.damage);

        const eventPacket : EnityEvent ={
            type: "Entity",
            enityId: this.Id,
            enityType: this.type,
            enventType: EntityEventType.UPDATE,
            data: {
                updateType: UpdateTypes.ACTION,
                data: {
                    type: ActionTypes.SHOOT,
                    data: {
                        target: target.id
                    }
                }
            }
        }
        this.eventBuss.add(eventPacket);
    }
        
    getState()  {
        return {
            data: {}
        }
    }
}
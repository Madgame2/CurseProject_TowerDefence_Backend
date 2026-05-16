import { Vector2 } from "src/types/Vector2";
import { INpc, NpcActions } from "../INpc";
import { INpcBehavior } from "../INpcBehavior";
import { IPatrolBehavior } from "../IPatrolBehavior";
import { WorldQuery } from "../../worldQuery/WorldQuery";
import { Vector3 } from "src/types/Vector3";
import { BehaviorTypes } from "../BehaviorTypes.enum";
import { IAttackable } from "../../EntitiesSystem/IAttackable";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";
import { DataType, NpcEventType, NpcUpdatePacket } from "src/sessions/Net/models/NpcUpdatepakcet";

function isAttackable(entity: any): entity is IAttackable {
    return !!entity
        && typeof entity === "object"
        && typeof entity.takeDamage === "function"
        && typeof entity.unsubscribeDeath === "function"
        && typeof entity.subscribeDeath === "function"
        && typeof entity.current_hp === "number"
        && typeof entity.max_hp === "number";
}


export class GuardianBehavior implements INpcBehavior, IPatrolBehavior{

    private patrollZoneCenter: Vector2| null = null;
    private patrollZoneRange: number =0;

    private changePositionTimer: number = 0;
    private changePositionInterval: number = 2; // каждые 2 секунды

    private target: INpc| null = null;

    private targetDeathCallback = () => {};

    private attackCooldown: number = 0;

    private lastTargetPos?: Vector2;

    private repathCooldown = 0;

    constructor(private readonly worldQuery: WorldQuery, private readonly eventBuss: WorldUpdatesStorage){}

    
    update(npc: INpc, delta: number): void {

        this.attackCooldown -= delta;
        if(!this.HasTarget()){
            this.logging(npc,delta)
        }else{
            this.chaseAndAttack(npc, delta);
        }
    }

    getState(): string {
        return ""
    }

    setPatrolZones(center:Vector2, radius: number){
        this.patrollZoneCenter = center;
        this.patrollZoneRange  = radius;
    }

    private chaseAndAttack(guardian: INpc, delta:number){

        if (!this.target || !isAttackable(this.target)) {
            this.clearTarget();
            return;
        }
        const target = this.target;

        const distance = Vector2.distance(guardian.position,target.position);

        const attackDistance  =
            guardian.radius +
            target.radius +
            guardian.config.attackRange;

        const chaseDistance = attackDistance - 0.75;

        if (distance > chaseDistance) {

            const targetPos = target.position;

            let repathInterval = 1.0; 

            if (distance > 10) {
                repathInterval = 1.5; 
            }
            else if (distance > 5) {
                repathInterval = 0.7; 
            }
            else {
                repathInterval = 0.3; 
            }

            this.repathCooldown -= delta;

            if (this.repathCooldown <= 0) {

                guardian.navAgent.setTarget(targetPos);

                this.lastTargetPos = targetPos;

                this.repathCooldown = repathInterval;
            }

            const moveDistance =
                guardian.config.speed *
                guardian.config.runMultiplier *
                delta;

            const direction = guardian.navAgent.update(
                guardian.position,
                moveDistance
            );

            if (!direction) {
                this.stop(guardian);
                return;
            }

            this.run(guardian, direction, delta);
            return;
        }

        guardian.navAgent.stop();
        this.stop(guardian);

        if(distance > attackDistance){
            return;
        }

        if(this.attackCooldown > 0){
            return;
        }

        guardian.lookAt(target.position);


        this.attack(guardian,target);
        this.attackCooldown = guardian.config.attackCooldown;
    }

    private attack(guardioan:INpc ,target: INpc){

        if(!isAttackable(target)) return

        target.takeDamage(guardioan.config.damage);


        console.log("АТТАКУЮ ", target.id);
        console.log(target.current_hp);
        const event : NpcUpdatePacket ={
            type: "Npc",
            npcType: guardioan.type,
            npcId: guardioan.id,
            enventType: NpcEventType.UPDATE,
            data:{
                dataType: DataType.ACTION,
                action: NpcActions.ATTACK
            }
        }
        
        this.eventBuss.add(event);
    }

private run(
    npc: INpc,
    direction: Vector2,
    delta: number
) {

    const speed =
        npc.config.speed *
        npc.config.runMultiplier;

    const moveDistance = speed * delta;

    npc.direction = direction;

    npc.velocity = direction.multiply(speed);

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

    private selectTarget(target:INpc){
        if (isAttackable(target)) {

            this.target = target
            // если уже была подписка — не забываем удалить
            this.unsubscribeFromTarget();

            this.targetDeathCallback = this.handleTargetDeath.bind(this);

            target.subscribeDeath(this.targetDeathCallback);
        }
    }

    private handleTargetDeath = () => {
        this.clearTarget();
    };

        private clearTarget() {
        this.unsubscribeFromTarget();

        this.target = null;
    }

    private unsubscribeFromTarget() {
        if (!this.target) return;

        if (isAttackable(this.target)) {
            this.target.unsubscribeDeath(this.targetDeathCallback);
        }
    }
    private logging(npc: INpc, delta: number){

        if(this.LockingForEnemy(npc)){
            return;
        }

        if(this.patrollZoneCenter!= null && this.whantToChangePosition(delta)){
            const newPoss = this.worldQuery.getRandomSpawnAround(this.patrollZoneCenter, 0,this.patrollZoneRange)
            npc.navAgent.setTarget(newPoss);
        }

        this.walk(npc,delta);
    }


    private walk(npc: INpc, delta: number) {

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

    private stop(npc: INpc) {
        npc.velocity = Vector2.zero();
    }

private move(
    npc: INpc,
    direction: Vector2,
    delta: number
) {
    const speed = npc.config.speed;
    const moveDistance = speed * delta;

    // direction уже должен быть нормализован navAgent'ом
    npc.direction = direction;

    npc.velocity = direction.multiply(speed);

    // прямое движение без Vector2.add (меньше мусора + проще snap)
    npc.position.x += direction.x * moveDistance;
    npc.position.y += direction.y * moveDistance;

    npc.rotation = new Vector3(
        0,
        Math.atan2(direction.x, direction.y) * (180 / Math.PI),
        0
    );
}

    private whantToChangePosition(delta: number):boolean{
        this.changePositionTimer += delta;

        if (this.changePositionTimer < this.changePositionInterval) {
            return false;
        }

        this.changePositionTimer = 0;

        // "бросок монетки"
        const coin = Math.random(); // 0..1

        // например 30% шанс сменить позицию
        return coin < 0.3;
    }

    private LockingForEnemy(npc:INpc):boolean{
       
        const tagets = this.worldQuery.getNPCsByBehavior(npc.position,npc.config.notifyRange,BehaviorTypes.ENEMY);
        if(tagets==null || tagets.length<=0){
            return false;
        }

        const clothestTarget = this.getClosest(npc.position, tagets);
        if(!clothestTarget) return false;

        this.selectTarget(clothestTarget);

        return true;
    }

        private HasTarget(): boolean {
            return this.target != null && isAttackable(this.target);
        }


       private getClosest(currentPos: Vector2 ,targets: INpc[]): INpc|null{
        let result: INpc | null = null;
        let minDistance: number =0;
        for(let target of targets){
            const distance = Vector2.distance(target.position, currentPos);

            if(result == null){
                result = target;
                minDistance  = distance
                continue;
            }
            if(minDistance> distance){
                minDistance = distance;
                result = target;
            }
        }


        return result;
    }
}
import { EntityesEnum } from "../../EntityesEnum";
import { EntityState } from "../../EntityState";
import { IEntity } from "../../IEntity";
import { Vector2 } from "src/types/Vector2";
import { INpc } from "src/sessions/World/npc/INpc";
import { WorldQuery } from "src/sessions/World/worldQuery/WorldQuery";
import { BehaviorTypes } from "src/sessions/World/npc/BehaviorTypes.enum";
import { IAttackable } from "../../IAttackable";
import { EnityEvent, EntityEventType } from "src/sessions/Net/models/EnityState";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";

enum ActoinTypes{
    ATTACk = "ATTACk"
}


export class TeslaTower implements IEntity{
    Id:string
    linkedPalyer: string
    position: Vector2
    type: EntityesEnum = EntityesEnum.TeslaTower;


    private attackCooldown = 0;
    private readonly fireRate = 1.0;
    private readonly JumpCount =5;
    private readonly damage = 2.5;

    private target: INpc | null = null;
    private range: number = 14;

    private worldQuery: WorldQuery;
    private eventBuss: WorldUpdatesStorage;

    constructor(id:string, linkedplayer:string, WorldPos: Vector2,
        worldQuery: WorldQuery, eventBuss: WorldUpdatesStorage
    ){
            this.Id = id;
            this.linkedPalyer = linkedplayer;

    
            this.position = WorldPos;

            this.worldQuery = worldQuery;
            this.eventBuss = eventBuss;
    }

    getState()  {
        return {}
    }

    update(delta: number) {
        
        this.tryShoot(delta)
    }
    


    private tryShoot(delta: number){

        if (this.attackCooldown > 0) {
            this.updateCooldown(delta);
            return;
        }

        const targets = this.worldQuery.getNPCsByBehavior(this.position, this.range, BehaviorTypes.ENEMY);

        if(targets == null || targets.length<=0){
            return;
        }

        const clothestTarget = this.getClosest(targets);
        if(!clothestTarget){
            return;
        }

        this.ShootTo(clothestTarget);
    }

    private ShootTo(clothestTarget: INpc) {
        this.attackCooldown = this.fireRate;

        const rootNode = this.buildTargetTree(clothestTarget);

        const damagedNodes = this.dfs(rootNode);

        this.applyDamage(damagedNodes);
        this.sendAttackEvent(rootNode);
    }

    private buildTargetTree(startNpc: INpc): LightNode {
        const rootNode = new LightNode();
        rootNode.npc = startNpc;

        const visited = new Set<string>([startNpc.id]);

        let currentNode: LightNode | null = rootNode;
        let jumpsLeft = this.JumpCount;

        while (currentNode && jumpsLeft > 0) {
            const candidates = this.worldQuery.getNPCsByBehavior(
                currentNode.npc.position,
                currentNode.readius,
                BehaviorTypes.ENEMY
            );

            const sorted = this.SortByDistance(currentNode.npc.position, candidates);

            // 🔥 ВАЖНО: фильтруем только attackable
            for (const npc of sorted) {
                if (!visited.has(npc.id) && this.isAttackable(npc)) {
                    currentNode.queue.push(npc);
                }
            }

            const nextNpc = currentNode.queue.pop();

            if (!nextNpc) {
                currentNode = currentNode.parent;
                continue;
            }

            visited.add(nextNpc.id);

            const nextNode = new LightNode();
            nextNode.npc = nextNpc;
            nextNode.parent = currentNode;

            currentNode.children.push(nextNode);

            currentNode = nextNode;
            jumpsLeft--;
        }

        return rootNode;
    }

    private isAttackable(npc: INpc): npc is INpc & IAttackable {
        return (
            typeof (npc as any).takeDamage === "function" &&
            typeof (npc as any).current_hp === "number" &&
            typeof (npc as any).max_hp === "number"
        );
    }

    private applyDamage(nodes: LightNode[]) {
        for (const node of nodes) {
            const npc = node.npc;

            if (this.isAttackable(npc)) {
                npc.takeDamage(this.damage);
            }
        }
    }

    private sendAttackEvent(rootNode: LightNode) {
        const npcIdsTree = this.GetNPCIdsTree(rootNode);

        const actionPacket: EnityEvent = {
            type: "Entity",
            enityId: this.Id,
            enityType: this.type,
            enventType: EntityEventType.UPDATE,
            data: {
                actionType: ActoinTypes.ATTACk,
                data: {
                    tree: npcIdsTree
                }
            }
        };

        this.PrintNpcTree(npcIdsTree);
        this.eventBuss.add(actionPacket);
    }

    private PrintNpcTree(root: NpcIdTree): void {
        this.PrintNode(root, 0);
    }

    private PrintNode(node: NpcIdTree, depth: number): void {
        const indent = "  ".repeat(depth);

        console.log(`${indent}- ${node.id}`);

        for (const child of node.children) {
            this.PrintNode(child, depth + 1);
        }
    }

    private dfs(root: LightNode): LightNode[] {
        const result: LightNode[] = [];

        function walk(node: LightNode | null) {
            if (!node) return;

            // текущая вершина
            result.push(node);

            // дети
            for (const child of node.children) {
                walk(child);
            }
        }

        walk(root);

        return result;
    }
    private GetNPCIdsTree(root: LightNode): NpcIdTree {
        function build(node: LightNode): NpcIdTree {
            return {
                id: node.npc.id,
                children: node.children.map(child => build(child))
            };
        }

        return build(root);
    }

    private SortByDistance(currentPos: Vector2, targets: INpc[]): INpc[] {

        return targets.sort((a, b) => {
            const distA = Vector2.distance(currentPos, a.position);
            const distB = Vector2.distance(currentPos, b.position);

            return distA - distB; // ближние будут первыми
        });
    }

    private updateCooldown(delta:number){
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    }

    private getClosest(targets: INpc[]): INpc|null{
        let result: INpc | null = null;
        let minDistance: number =0;
        for(let target of targets){
            const distance = Vector2.distance(target.position, this.position);

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

type NpcIdTree = {
    id: string;
    children: NpcIdTree[];
};

class LightNode{
    npc!: INpc
    children: LightNode[] = []
    parent: LightNode | null = null;

    queue: INpc[] =[]

    readius: number = 5;
}
import { INpc } from "src/sessions/World/npc/INpc";
import { EntityesEnum } from "../../EntityesEnum";
import { EntityState } from "../../EntityState";
import { IEntity } from "../../IEntity";
import { Vector2 } from "src/types/Vector2";
import { NpcFactory } from "src/sessions/World/npc/Factory/NpcFactory";
import { NpcTypes } from "src/sessions/World/npc/NpcTypes.enum";
import { BehaviorTypes } from "src/sessions/World/npc/BehaviorTypes.enum";
import { World } from "src/sessions/World/Entities/World";
import { WorldQuery } from "src/sessions/World/worldQuery/WorldQuery";
import { GuardianBehavior } from "src/sessions/World/npc/Behaviors/GuardianBehavior";


export class Camp implements IEntity{
    Id:string
    linkedPalyer: string
    position: Vector2
    type: EntityesEnum = EntityesEnum.Camp;


    private npcFactory: NpcFactory;
    private world: World
    private worldQuery: WorldQuery

    private linkedNpc: INpc| null = null;

    private readonly patrollZoneRange = 3;

    constructor(id:string, linkedplayer:string, WorldPos: Vector2,
        npcFactory:NpcFactory, world: World, worldQuery: WorldQuery
    ){
            this.Id = id;
            this.linkedPalyer = linkedplayer;

            this.npcFactory = npcFactory;
            this.world = world;
            this.worldQuery = worldQuery;
    
            this.position = WorldPos;
    }

    update(delta: number) {
        if(!this.IInited()){
            console.log("СПАВНЮ NPC");
           this.linkedNpc = this.npcFactory.create(NpcTypes.KNIGHT,BehaviorTypes.GUARDION);
           this.linkedNpc.position = this.worldQuery.getRandomSpawnAround(this.position,0,1);
           this.world.addNpc(this.linkedNpc);

           const npcBehaver = this.linkedNpc.getBehavior();
           if(npcBehaver instanceof GuardianBehavior){
                npcBehaver.setPatrolZones(this.position, this.patrollZoneRange)
           }
        }
    }

    private IInited():boolean{
        return this.linkedNpc!==null;
    }
    
    getState()  {
        return {}
    }
}
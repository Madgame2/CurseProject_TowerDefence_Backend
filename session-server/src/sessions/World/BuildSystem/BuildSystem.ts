import { Vector2 } from "src/types/Vector2";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { World } from "../Entities/World";
import { PlayerStates } from "../Entities/Player";
import { Player } from "../Entities/Player";
import { ChankUpdate } from "src/sessions/Net/models/ChankUpdate";
import { Chank } from "../Chanks/Chank";
import { EntityesEnum } from "../EntitiesSystem/EntityesEnum";
import { EnityEvent, EntityEventType } from "src/sessions/Net/models/EnityState";
import { GrossCannonInBuild } from "../EntitiesSystem/imp/GrossCannon/GrossCannon.inBuild";
import { GrossCannon } from "../EntitiesSystem/imp/GrossCannon/GrossCannon";
import { TeslaTowerInBuild } from "../EntitiesSystem/imp/TeslaTower/TeslaTower.inBuild";
import { TeslaTower } from "../EntitiesSystem/imp/TeslaTower/TeslaTower";
import { CampInBuild } from "../EntitiesSystem/imp/Camp/Camp.inBuild";
import { Camp } from "../EntitiesSystem/imp/Camp/Camp";

type ConstuctorEntity ={
    pos:Vector2,
    buildId: number
}

export class BuildSystem{


    private _buildingUnderConstraction : Map<string, ConstuctorEntity> = new Map<string, ConstuctorEntity>();

    constructor(private readonly worldQuery: WorldQuery, private readonly world:World){}

    async PreperForBuilding(playerID:string ,worldPos: Vector2, buildNetId: number){
        if(!this.worldQuery.isPositionFree(worldPos)) return;

        console.log(buildNetId);
        this._buildingUnderConstraction.set(playerID,{pos: worldPos, buildId:buildNetId});
        this.worldQuery.setBlock(worldPos.x,worldPos.y, buildNetId);

        const player = this.world.getPlayer(playerID);
        console.log(worldPos);
        player?.navAgent.setTarget(worldPos);
        player!.state = PlayerStates.IN_RUNNING_BUILD;

        const UpdateWorlddata : ChankUpdate = {
            type: "chunk",
            chankPos: this.worldQuery.getChankPos(worldPos.x, worldPos.y),
            chankCell:  this.worldQuery.getlocalBlockPos(worldPos.x, worldPos.y),
            cellData: buildNetId
        }

        console.log(UpdateWorlddata);
        this.world.worldUpdatesStorage.add(UpdateWorlddata);

        const result = await this.waitUntilGetClose(player!, worldPos, 1)
        if(result){
            this.startBuilding(playerID, worldPos, buildNetId)
        }else{
            this.CancelPrepearingForBuilding(playerID)
        }
    }

    CancelPrepearingForBuilding(PlayerId:string){

        const data = this._buildingUnderConstraction.get(PlayerId)
        if(!data) return;

        this.worldQuery.setBlock(data.pos.x,data.pos.y, 0);
        this._buildingUnderConstraction.delete(PlayerId);
    }

    private startBuilding(playerId: string, worldPos: Vector2, buildingId:number){
        const player = this.world.getPlayer(playerId);
        this._buildingUnderConstraction.delete(playerId);

        player!.state = PlayerStates.BLOCKED_ADN_HIDE;

        switch(buildingId){
            case 2: //GrossCannonINIt
                this.worldQuery.setBlock(worldPos.x,worldPos.y, 3);
                const enity = this.world.entityFactory.CreateEntity(EntityesEnum.GrossCannonInBuild,playerId,worldPos) as GrossCannonInBuild;
                enity.onCompleted = (e) => this.onBuildCompleted(e);
                this.world.addEnity(enity);

                    const UpdateWorlddata : ChankUpdate = {
                        type: "chunk",
                        chankPos: this.worldQuery.getChankPos(worldPos.x, worldPos.y),
                        chankCell:  this.worldQuery.getlocalBlockPos(worldPos.x, worldPos.y),
                        cellData: 3
                    }

                    console.log(UpdateWorlddata);
                this.world.worldUpdatesStorage.add(UpdateWorlddata);

                const event: EnityEvent ={
                    type: "Entity",
                    enityId: enity.Id,
                    enventType: EntityEventType.SPAWN,
                    enityType: EntityesEnum.GrossCannonInBuild,
                    data:{
                        possiton: enity.position,
                        progress: enity.inBuildProgeress/enity.buildCosst
                    }
                } 
                this.world.worldUpdatesStorage.add(event);
            break;
            case 5:
                {
                    this.worldQuery.setBlock(worldPos.x,worldPos.y, 6);
                    const enity = this.world.entityFactory.CreateEntity(EntityesEnum.TeslaTowerBuild,playerId,worldPos) as TeslaTowerInBuild;
                    enity.onCompleted = (e) => this.onTeslaTowerBuildCompleted(e);
                                    this.world.addEnity(enity);

                    const UpdateWorlddata : ChankUpdate = {
                        type: "chunk",
                        chankPos: this.worldQuery.getChankPos(worldPos.x, worldPos.y),
                        chankCell:  this.worldQuery.getlocalBlockPos(worldPos.x, worldPos.y),
                        cellData: 6
                    }

                    console.log(UpdateWorlddata);
                this.world.worldUpdatesStorage.add(UpdateWorlddata);

                const event: EnityEvent ={
                    type: "Entity",
                    enityId: enity.Id,
                    enventType: EntityEventType.SPAWN,
                    enityType: EntityesEnum.TeslaTowerBuild,
                    data:{
                        possiton: enity.position,
                        progress: enity.inBuildProgeress/enity.buildCosst
                    }
                } 
                this.world.worldUpdatesStorage.add(event);
                }
                break
            case 8:{
                    this.worldQuery.setBlock(worldPos.x,worldPos.y, 9);
                    const enity = this.world.entityFactory.CreateEntity(EntityesEnum.CampInBuild,playerId,worldPos) as CampInBuild;
                    enity.onCompleted = (e) => this.onCampBuildCompleted(e);
                                    this.world.addEnity(enity);

                    const UpdateWorlddata : ChankUpdate = {
                        type: "chunk",
                        chankPos: this.worldQuery.getChankPos(worldPos.x, worldPos.y),
                        chankCell:  this.worldQuery.getlocalBlockPos(worldPos.x, worldPos.y),
                        cellData: 9
                    }

                    console.log(UpdateWorlddata);
                this.world.worldUpdatesStorage.add(UpdateWorlddata);

                const event: EnityEvent ={
                    type: "Entity",
                    enityId: enity.Id,
                    enventType: EntityEventType.SPAWN,
                    enityType: EntityesEnum.CampInBuild,
                    data:{
                        possiton: enity.position,
                        progress: enity.inBuildProgeress/enity.buildCosst
                    }
                } 
                this.world.worldUpdatesStorage.add(event);
                }    
        }

    }


        private onCampBuildCompleted(building: CampInBuild) {

        const removeEvent: EnityEvent = {
            type: "Entity",
            enityId: building.Id,
            enventType: EntityEventType.TERMINATE,
            enityType: EntityesEnum.CampInBuild,
            data:{}
        };

        this.world.worldUpdatesStorage.add(removeEvent);

        this.world.removeEntity(building.Id);

        this.worldQuery.setBlock(building.position.x, building.position.y, /* final block id */ 10);

        const ready = this.world.entityFactory.CreateEntity(
            EntityesEnum.Camp,
            building.linkedPalyer,
            building.position
        ) as Camp;

        this.world.addEnity(ready);

        const event: EnityEvent = {
            type: "Entity",
            enityId: ready.Id,
            enventType: EntityEventType.SPAWN,
            enityType: EntityesEnum.Camp,
            data: {
                possiton: ready.position
            }
        };
        console.log(event);
        this.world.worldUpdatesStorage.add(event);

        const player = this.world.getPlayer(building.linkedPalyer);
        player!.state = PlayerStates.IDEL;

    }

    private onTeslaTowerBuildCompleted(building: TeslaTowerInBuild) {

        const removeEvent: EnityEvent = {
            type: "Entity",
            enityId: building.Id,
            enventType: EntityEventType.TERMINATE,
            enityType: EntityesEnum.TeslaTowerBuild,
            data:{}
        };

        this.world.worldUpdatesStorage.add(removeEvent);

        this.world.removeEntity(building.Id);

        this.worldQuery.setBlock(building.position.x, building.position.y, /* final block id */ 7);

        const ready = this.world.entityFactory.CreateEntity(
            EntityesEnum.TeslaTower,
            building.linkedPalyer,
            building.position
        ) as TeslaTower;

        this.world.addEnity(ready);

        const event: EnityEvent = {
            type: "Entity",
            enityId: ready.Id,
            enventType: EntityEventType.SPAWN,
            enityType: EntityesEnum.TeslaTower,
            data: {
                possiton: ready.position
            }
        };
        console.log(event);
        this.world.worldUpdatesStorage.add(event);

        const player = this.world.getPlayer(building.linkedPalyer);
        player!.state = PlayerStates.IDEL;

    }

    private onBuildCompleted(building: GrossCannonInBuild) {

        const removeEvent: EnityEvent = {
            type: "Entity",
            enityId: building.Id,
            enventType: EntityEventType.TERMINATE,
            enityType: EntityesEnum.GrossCannonInBuild,
            data:{}
        };

        this.world.worldUpdatesStorage.add(removeEvent);

        this.world.removeEntity(building.Id);

        this.worldQuery.setBlock(building.position.x, building.position.y, /* final block id */ 4);

        const ready = this.world.entityFactory.CreateEntity(
            EntityesEnum.GrossCannon,
            building.linkedPalyer,
            building.position
        ) as GrossCannon;

        this.world.addEnity(ready);

        const event: EnityEvent = {
            type: "Entity",
            enityId: ready.Id,
            enventType: EntityEventType.SPAWN,
            enityType: EntityesEnum.GrossCannon,
            data: {
                possiton: ready.position
            }
        };
        console.log(event);
        this.world.worldUpdatesStorage.add(event);

        const player = this.world.getPlayer(building.linkedPalyer);
        player!.state = PlayerStates.IDEL;

    }

    private async waitUntilGetClose(
        player: Player,
        targetPos: Vector2,
        radius: number
    ): Promise<boolean> {

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        while (true) {

            console.log("player: ", player.position, " target: ",targetPos);
            const playerPos = new Vector2(player.position.x, player.position.z);
            const distance = Vector2.subtract(playerPos, targetPos).length();
            console.log(distance)
            if (distance <= radius) {
                return true;
            }

            if (player.state !== PlayerStates.IN_RUNNING_BUILD) {
                return false;
            }

            await delay(50); 
        }
    }
}
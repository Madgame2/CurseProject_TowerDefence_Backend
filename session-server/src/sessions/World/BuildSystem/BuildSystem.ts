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
        this._buildingUnderConstraction[playerID] = {pos: worldPos, buildId:buildNetId}
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
        }
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
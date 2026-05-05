import { EntityesEnum } from "../../EntityesEnum";
import { EntityState } from "../../EntityState";
import { IEntity } from "../../IEntity";
import { Vector2 } from "src/types/Vector2";

export class TeslaTower implements IEntity{
    Id:string
    linkedPalyer: string
    position: Vector2
    type: EntityesEnum = EntityesEnum.TeslaTower;

    constructor(id:string, linkedplayer:string, WorldPos: Vector2){
            this.Id = id;
            this.linkedPalyer = linkedplayer;

    
            this.position = WorldPos;
    }

    update(delta: number) {
        
    }
    
    getState()  {

    }
}
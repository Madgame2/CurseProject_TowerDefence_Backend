import { Vector2 } from "src/types/Vector2";
import { IEntity } from "../../IEntity";



export class GrossCannonInBuild implements IEntity{
    Id:string
    linkedPalyer: string
    inBuildProgeress:number
    buildCosst: number

    position: Vector2

    constructor(id:string, linkedplayer:string, WorldPos: Vector2){
        this.Id = id;
        this.linkedPalyer = linkedplayer;
        this.inBuildProgeress =0;
        this.buildCosst = 1000;

        this.position = WorldPos;
    }
}
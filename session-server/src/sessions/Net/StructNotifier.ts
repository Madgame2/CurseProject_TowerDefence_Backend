import { Vector2 } from "src/types/Vector2";
import { StructureEntity, StructureEntityWithHP } from "../World/Structures/StructureEntity";
import { Structure } from "../World/Structures/StructureModels";
import { RootHouse } from "../World/Structures/stuctures_imp/RootHouse.struct";

export class structNotifaer{

    private calculateArea(structObj: StructureEntity,structure: Structure) :Vector2[]{
        const position = structObj.position;
        const outArray :Vector2[] = []

        for(var block of structure.blocks){
            const newVector = new Vector2(position.x+block.x, position.y+ block.z);
            outArray.push(newVector)
        }

        return outArray;
    }

    createNotifieObj(structObj: StructureEntity):structNotifObjBase|null{

        switch(structObj.StuructID){
            case RootHouse.id:{

                const area: Vector2[] = this.calculateArea(structObj, RootHouse);

                return new RootHouseNofiyObject(
                    structObj.id,
                    RootHouse.id,
                    structObj.position,
                    area,
                    (structObj as StructureEntityWithHP).hp
                )
            }
        }
        return null;
    }
}


export class structNotifObjBase{
    constructor(public id:string,
        public structId:string,
        public position:Vector2,
        public area: Vector2[]
    ){}
}

export class RootHouseNofiyObject extends structNotifObjBase{
    constructor(public id:string,
        public structId:string,
        public position:Vector2,
        public area: Vector2[],
        public hp:number){
        super(id, structId,position, area)
    }
}
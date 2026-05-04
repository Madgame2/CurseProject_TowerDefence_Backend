import { IEntity } from "./IEntity";
import { EntityesEnum } from "./EntityesEnum";
import { GrossCannonInBuild } from "./imp/GrossCannon/GrossCannon.inBuild";
import { randomUUID } from "crypto";
import { Vector2 } from "src/types/Vector2";

export class EntitiesFactory{
    CreateEntity(type:EntityesEnum, playerId: string, worldPos:Vector2): IEntity{
        switch(type){
            case EntityesEnum.GrossCannonInBuild:
                const enityId = randomUUID();
                return new GrossCannonInBuild(enityId,playerId,worldPos)
            break;
        }
    }
}
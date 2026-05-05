import { IEntity } from "./IEntity";
import { EntityesEnum } from "./EntityesEnum";
import { GrossCannonInBuild } from "./imp/GrossCannon/GrossCannon.inBuild";
import { randomUUID } from "crypto";
import { Vector2 } from "src/types/Vector2";
import { GrossCannon } from "./imp/GrossCannon/GrossCannon";
import { TeslaTowerInBuild } from "./imp/TeslaTower/TeslaTower.inBuild";
import { TeslaTower } from "./imp/TeslaTower/TeslaTower";
import { CampInBuild } from "./imp/Camp/Camp.inBuild";
import { Camp } from "./imp/Camp/Camp";

export class EntitiesFactory{
    CreateEntity(type:EntityesEnum, playerId: string, worldPos:Vector2): IEntity{
        switch(type){
            case EntityesEnum.GrossCannonInBuild:
                {
                    const enityId = randomUUID();
                    return new GrossCannonInBuild(enityId,playerId,worldPos)
                }
            case EntityesEnum.GrossCannon:
                {
                    const enityId = randomUUID();
                    return new GrossCannon(enityId,playerId,worldPos);
                }

            case EntityesEnum.TeslaTowerBuild:{
                const enityId = randomUUID();
                return new TeslaTowerInBuild(enityId,playerId,worldPos);
            }
            case EntityesEnum.TeslaTower:{
                const enityId = randomUUID();
                return new TeslaTower(enityId,playerId,worldPos);
            }

            case EntityesEnum.CampInBuild:{
                const enityId = randomUUID();
                return new CampInBuild(enityId,playerId,worldPos);
            }
            case EntityesEnum.Camp:{
                const enityId = randomUUID();
                return new Camp(enityId,playerId,worldPos);
            }
        }
    }
}
import { Vector2 } from "src/types/Vector2";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { StructureService } from "../Structures/StructService";
import { RootHouse } from "../Structures/stuctures_imp/RootHouse.struct";
import { StructureEntity, StructureEntityWithHP } from "../Structures/StructureEntity";
import { Structure } from "../Structures/StructureModels";
import { randomUUID } from "crypto";
import { Console } from "console";

export class DecorationGenerator {

    constructor(
        private seed: number,
        private worldQuery: WorldQuery,
        private structureService: StructureService
    ) {}



    PlaseRootHouse(    
        structure: Structure,
        worldX: number,
        worldZ: number): StructureEntityWithHP | null {
        const basePos = new Vector2(worldX, worldZ);

        const pos = this.worldQuery.findFreeSpawn(basePos, 10);

        if (!pos) {
            console.warn("Не нашли место для базы");
            return null;
        }

        const success = this.structureService.placeStructure(
            structure,
            Math.floor(pos.x),
            Math.floor(pos.z)
        );
        console.log("Структура размещенна");
        console.log("ВОТ Е БЛОК", Math.floor(pos.x), " ",Math.floor(pos.z)  );
        console.log(this.worldQuery.getBlock(Math.floor(pos.x),
            Math.floor(pos.z)));

        if (!success) {
            console.warn("Не удалось разместить структуру");
        }

        const EntityID = randomUUID();
        const entity = new StructureEntityWithHP(
            EntityID,
            structure.id,
            new Vector2(Math.floor(pos.x),
            Math.floor(pos.z)),
            structure.hp
        );

        return entity;
    }

}
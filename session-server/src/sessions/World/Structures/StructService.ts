import { WorldQuery } from "../worldQuery/WorldQuery";
import { ChankManager } from "../Chanks/ChunkManager";
import { Structure } from "./StructureModels";
import { Vector2 } from "src/types/Vector2";
import { Chank } from "../Chanks/Chank";
import { channel } from "diagnostics_channel";


export class StructureService {

    constructor(
        private worldQuery: WorldQuery,
        private chunkManager: ChankManager
    ) {}

    placeStructure(structure: Structure, worldX: number, worldZ: number): boolean {

        console.log("WORLD: ", worldX," " ,worldZ );
        // 1. Проверяем что место свободно
        for (const block of structure.blocks) {
            const x = worldX + block.x;
            const z = worldZ + block.z;

            if (!this.worldQuery.isPositionFree(new Vector2(x, z))) {
                return false;
            }
        }

        // 2. Ставим блоки
        for (const block of structure.blocks) {
            const x = worldX + block.x;
            const z = worldZ + block.z;

            const chunk = this.chunkManager.getChunkByWorldPos(x, z);
            const { lx, lz } = chunk.worldToLocal(x, z);

            chunk.setBlock(lx, lz, block.blockId);

            chunk.drawConsole();
        }



        return true;
    }
}
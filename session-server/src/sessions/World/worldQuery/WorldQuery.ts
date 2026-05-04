import { World } from "../Entities/World";
import { Vector3 } from "src/types/Vector3";
import { Vector2 } from "src/types/Vector2";
import { Block } from "../Entities/Block";
import { BlockRegistry } from "../BlockRegistry";


export class WorldQuery{

    constructor(private world: World){}

    getBlock(x: number, z: number): Block {
        const chunk = this.world.chankManager.getChunkByWorldPos(x, z);

        const { lx, lz } = chunk.worldToLocal(x, z);

        const blockId = chunk.getBlock(lx, lz);

        return BlockRegistry.get(blockId) ?? BlockRegistry.get(0)!;
    }

    getChankPos(x: number, z: number): Vector2{
        const chunk = this.world.chankManager.getChunkByWorldPos(x, z);
        return  new Vector2 (chunk.x, chunk.z);
    }

    
    getlocalBlockPos(x: number, z: number): Vector2{
        const chunk = this.world.chankManager.getChunkByWorldPos(x, z);
        const { lx, lz } = chunk.worldToLocal(x, z);
        return  new Vector2 (lx, lz);
    }

    setBlock(x: number, z: number, blockId:number) {
        const chunk = this.world.chankManager.getChunkByWorldPos(x, z);

        const { lx, lz } = chunk.worldToLocal(x, z);

        chunk.setBlock(lx, lz, blockId);
    }

    isPositionFree(pos: Vector2): boolean {

        const feet = this.getBlock(pos.x, pos.y)

        return !feet.isSolid
    }

    findFreeSpawn(basePos: Vector2, radius: number): Vector3 | null {
    for (let i = 0; i < 30; i++) {
        const offsetX = (Math.random() - 0.5) * 10
        const offsetZ = (Math.random() - 0.5) * 10

        const pos = new Vector3(
            basePos.x + offsetX,
            0,
            basePos.y + offsetZ
        )

        if (this.isPositionFree(pos)) {
            return pos
        }
    }

    return null
}
}
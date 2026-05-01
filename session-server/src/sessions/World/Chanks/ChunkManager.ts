import { Injectable } from "@nestjs/common";
import { Chank } from "./Chank";
import { Vector2 } from "src/types/Vector2";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { StructureService } from "../Structures/StructService";
import { RootHouse } from "../Structures/stuctures_imp/RootHouse.struct";

function xzKey(x: number, z: number): string {
    return `${x}:${z}`;
}

export class ChankManager{
    private chunks = new Map<string, Chank>();
    private rootChanks: Chank[] = []

    worldQuery!: WorldQuery;

    public static readonly chankSize:number

    constructor(
        private chankSize: number){
            this.chankSize = chankSize;
        }

    getChunk(x: number, z: number): Chank {
        const key = xzKey(x, z);

        if (!this.chunks.has(key)) {
        const chunk = this.generateChunk(x, z);
        this.chunks.set(key, chunk);
        }

        return this.chunks.get(key)!;
    }


    preloadArea(cx: number, cz: number, radius: number){
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const chank = this.getChunk(cx + x, cz + z);

                this.rootChanks.push(chank);
            }
        }
    }

    getRootChanks():Chank[]{
        return this.rootChanks;
    }

    private generateChunk(x: number, z: number): Chank {
        const chunk = new Chank(x, z, this.chankSize);

        //this.generateDecorations(chunk);

        return chunk;
    }


    getChunkByWorldPos(x: number, z:number): Chank{
        const cx = Math.floor(x / this.chankSize);
        const cz = Math.floor(z / this.chankSize);

        return this.getChunk(cx, cz);
    }
}
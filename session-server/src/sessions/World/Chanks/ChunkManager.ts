import { Injectable } from "@nestjs/common";
import { Chank } from "./Chank";
import { RenderPipline } from "../RenderPipline/RenderPipline";

function xzKey(x: number, z: number): string {
    return `${x}:${z}`;
}

@Injectable()
export class ChankManager{
    private chunks = new Map<string, Chank>();
    private rootChanks: Chank[] = []

    constructor(private renderPipline: RenderPipline){}

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
        const chunk = new Chank(x, z);

        //this.generateDecorations(chunk);

        return chunk;
    }
}
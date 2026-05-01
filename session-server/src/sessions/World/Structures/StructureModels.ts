export type StructureBlock = {
    x: number;
    z: number;
    blockId: number;
}

export class Structure {
    constructor(
        public readonly id: string,
        public readonly width: number,
        public readonly height: number,
        public readonly blocks: StructureBlock[],
        public readonly hp: number
    ) {}
}
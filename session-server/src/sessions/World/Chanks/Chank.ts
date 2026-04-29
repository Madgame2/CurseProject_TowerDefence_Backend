

export class Chank{

    private blocks: Uint8Array;

    constructor(
        public readonly x: number,
        public readonly z: number,
        private readonly size: number
    ) {
        this.blocks = new Uint8Array(size * size);
    }

    worldToLocal(wx: number, wz: number) {
        const lx = wx - this.x * this.size;
        const lz = wz - this.z * this.size;

        return { lx, lz };
    }

    containsWorldPos(wx: number, wz: number): boolean {
        const minX = this.x * this.size;
        const minZ = this.z * this.size;

        return (
            wx >= minX &&
            wx < minX + this.size &&
            wz >= minZ &&
            wz < minZ + this.size
        );
    }

    private index(x: number, z: number): number {
        return z * this.size + x;
    }

    getBlock(x: number, z: number): number {
        return this.blocks[this.index(x, z)];
    }

    setBlock(x: number, z: number, value: number) {
        this.blocks[this.index(x, z)] = value;
    }
}
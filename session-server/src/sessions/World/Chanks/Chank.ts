

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

    getAllBlocksLocal() {
        const result: { x: number; z: number; value: number }[] = [];

        for (let z = 0; z < this.size; z++) {
            for (let x = 0; x < this.size; x++) {
                const value = this.getBlock(x, z);

                result.push({ x, z, value });
            }
        }

        return result;
    }
    drawConsole() {
    let output = "";

    for (let z = 0; z < this.size; z++) {
        let row = "";

        for (let x = 0; x < this.size; x++) {
            const value = this.getBlock(x, z);

            // красиво отображаем
            row += value === 0 ? ". " : "# ";
        }

        output += row + "\n";
    }

    //console.log(`CHUNK (${this.x}, ${this.z})\n` + output);
}
}
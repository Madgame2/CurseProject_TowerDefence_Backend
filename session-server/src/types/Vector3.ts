export class Vector3 {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0
    ) {}

    // ===== INSTANCE =====

    add(v: Vector3) {
        return new Vector3(
            this.x + v.x,
            this.y + v.y,
            this.z + v.z
        );
    }

    subtract(v: Vector3) {
        return new Vector3(
            this.x - v.x,
            this.y - v.y,
            this.z - v.z
        );
    }

    multiply(s: number) {
        return new Vector3(
            this.x * s,
            this.y * s,
            this.z * s
        );
    }

    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector3();
        return this.multiply(1 / len);
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    // ===== STATIC =====

    static add(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            a.x + b.x,
            a.y + b.y,
            a.z + b.z
        );
    }

    static subtract(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(
            a.x - b.x,
            a.y - b.y,
            a.z - b.z
        );
    }

    static multiply(v: Vector3, scalar: number): Vector3 {
        return new Vector3(
            v.x * scalar,
            v.y * scalar,
            v.z * scalar
        );
    }

    static length(v: Vector3): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
    }

    static normalize(v: Vector3): Vector3 {
        const len = Vector3.length(v);
        if (len === 0) return new Vector3();
        return Vector3.multiply(v, 1 / len);
    }

    static distance(a: Vector3, b: Vector3): number {
        return Vector3.subtract(a, b).length();
    }

    static zero(): Vector3 {
        return new Vector3(0, 0, 0);
    }

    static from(obj: { x: number; y?: number; z: number }): Vector3 {
        return new Vector3(obj.x, obj.y ?? 0, obj.z);
    }
}
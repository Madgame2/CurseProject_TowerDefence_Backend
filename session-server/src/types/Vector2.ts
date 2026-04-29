export class Vector2 {
    constructor(
        public x: number = 0,
        public y: number = 0
    ) {}

    // ===== INSTANCE =====

    add(v: Vector2) {
        return new Vector2(
            this.x + v.x,
            this.y + v.y
        );
    }

    subtract(v: Vector2) {
        return new Vector2(
            this.x - v.x,
            this.y - v.y
        );
    }

    multiply(s: number) {
        return new Vector2(
            this.x * s,
            this.y * s
        );
    }

    length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    normalize() {
        const len = this.length();
        if (len === 0) return new Vector2();
        return this.multiply(1 / len);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    // ===== STATIC =====

    static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(
            a.x + b.x,
            a.y + b.y
        );
    }

    static subtract(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(
            a.x - b.x,
            a.y - b.y
        );
    }

    static multiply(v: Vector2, scalar: number): Vector2 {
        return new Vector2(
            v.x * scalar,
            v.y * scalar,
        );
    }

    static length(v: Vector2): number {
        return Math.sqrt(v.x ** 2 + v.y ** 2);
    }

    static normalize(v: Vector2): Vector2 {
        const len = Vector2.length(v);
        if (len === 0) return new Vector2();
        return Vector2.multiply(v, 1 / len);
    }

    static distance(a: Vector2, b: Vector2): number {
        return Vector2.subtract(a, b).length();
    }

    static zero(): Vector2 {
        return new Vector2(0, 0);
    }

    static from(obj: { x: number; y?: number;}): Vector2 {
        return new Vector2(obj.x, obj.y ?? 0);
    }
}
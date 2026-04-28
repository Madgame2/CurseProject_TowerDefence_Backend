import { Vector3 } from "src/types/Vector3";

export class Player {
    id: string;

    position: Vector3;
    velocity: Vector3;

    moveIntent: Vector3 | null;

    speed: number;

    hp: number;

    constructor(id: string) {
        this.id = id;

        this.position = new Vector3(0, 0, 0);
        this.velocity = new Vector3(0, 0, 0);

        this.moveIntent = null;

        this.speed = 5;
        this.hp = 100;
    }
}
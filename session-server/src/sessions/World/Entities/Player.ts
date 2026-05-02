import { Vector3 } from "src/types/Vector3";
import { NavAgent } from "../NavSystem/NavAgent";

export enum PlayerStates {
    IDEL = "IDEL",
    RUNING = "RUNING"
}

export class Player {
    id: string;

    position: Vector3;
    velocity: Vector3;
    direction: Vector3;
    rotation: Vector3;

    moveIntent: Vector3 | null;

    speed: number;

    hp: number;

    state: PlayerStates;

    navAgent: NavAgent



    constructor(id: string,navAgent: NavAgent ) {
        this.id = id;
        this.navAgent = navAgent

        this.position = new Vector3(0, 0, 0);
        this.velocity = new Vector3(0, 0, 0);
        this.direction = new Vector3(0, 0, 0);
        this.rotation = new Vector3(0, 0, 0);

        this.moveIntent = null;

        this.state = PlayerStates.IDEL;

        this.speed = 2;
        this.hp = 100;
    }
}
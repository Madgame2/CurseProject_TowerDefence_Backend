import { Vector3 } from "src/types/Vector3";
import { NavAgent } from "../NavSystem/NavAgent";
import { EventAgent } from "../EventAgent/EventAgent";

export enum PlayerStates {
    IDEL = "IDEL",
    RUNING = "RUNING",
    IN_RUNNING_BUILD = "IN_RUNNING_BUILD",
    BLOCKED_ADN_HIDE = "BLOCKED_ADN_HIDE"
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
    eventAgent: EventAgent


    constructor(id: string,navAgent: NavAgent, eventAgent: EventAgent ) {
        this.id = id;
        this.navAgent = navAgent
        this.eventAgent = eventAgent;

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
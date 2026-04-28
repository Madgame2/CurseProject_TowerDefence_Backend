import { PlayerStates } from "src/sessions/World/Entities/Player";
import { Vector3 } from "src/types/Vector3";

export interface PlayerState {
    id: string;
    position: Vector3;
    rotation: Vector3;
    velocity: Vector3;
    state: PlayerStates;
}
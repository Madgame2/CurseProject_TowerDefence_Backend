import { PlayerStates } from "src/sessions/World/Entities/Player";
import { Vector3 } from "src/types/Vector3";
import { IWorldUpdateState } from "./IWordlUpdateState";

export interface PlayerState extends IWorldUpdateState  {
    type: "playerState";
    id: string;
    position: Vector3;
    rotation: Vector3;
    velocity: Vector3;
    state: PlayerStates;
}
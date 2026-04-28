import { PlayerState } from "./PlayerState";

export interface WorldUpdateData {
    tick: number;

    players?: PlayerState[];
}
import { ChankUpdate } from "./ChankUpdate";
import { EnityEvent } from "./EnityState";
import { PlayerState } from "./PlayerState";

export interface WorldUpdateData {
    tick: number;

    players?: PlayerState[];
    chanks?: ChankUpdate[];
    enities?: EnityEvent[];
}
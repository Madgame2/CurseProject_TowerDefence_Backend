import { ChankUpdate } from "./ChankUpdate";
import { CommnonInfo } from "./CommonInfo";
import { DireectorUpdatePacket } from "./DirectorUpdatePaket";
import { EnityEvent } from "./EnityState";
import { NpcUpdatePacket } from "./NpcUpdatepakcet";
import { PlayerState } from "./PlayerState";

export interface WorldUpdateData {
    tick: number;

    players?: PlayerState[];
    chanks?: ChankUpdate[];
    enities?: EnityEvent[];
    npc?:NpcUpdatePacket[];
    director?: DireectorUpdatePacket[];
    common?: CommnonInfo[];
}
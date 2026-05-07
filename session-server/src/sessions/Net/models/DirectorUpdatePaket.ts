import { MatchPhase } from "src/sessions/World/DirectorSystem/DirectorSystem";
import { IWorldUpdateState } from "./IWordlUpdateState";


 export interface DireectorUpdatePacket  extends IWorldUpdateState {
    type: "Director";
    matchPahase: MatchPhase;
    data?: any;
}   
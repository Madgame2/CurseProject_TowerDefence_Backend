import { Vector2 } from "src/types/Vector2"
import { IWorldUpdateState } from "./IWordlUpdateState";



export interface ChankUpdate  extends IWorldUpdateState {
    type: "chunk";
    chankPos: Vector2;
    chankCell: Vector2;
    cellData: number
}
import { IWorldUpdateState } from "./IWordlUpdateState";


export type buildSystemInfo ={
    currentBuilded: number,
    max_Buildings: number
}

export interface CommnonInfo extends IWorldUpdateState{
    type: "Common",
    buidlSystem?: buildSystemInfo
    wave?: number;
}
import { WorldUpdateData } from "./WorldUpdateData";

export class WorldUpdatePaket{
    action = "world_update";
    data: WorldUpdateData;
    constructor(data: WorldUpdateData){
        this.data = data;
    }
}
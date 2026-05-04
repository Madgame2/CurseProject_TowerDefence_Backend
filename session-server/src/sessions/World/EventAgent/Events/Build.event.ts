import { BuildSystem } from "../../BuildSystem/BuildSystem";
import { IPlayerEvent } from "../IEvent";



export class BuidlEvent implements IPlayerEvent{
 
    constructor(private buildSystem: BuildSystem){}

    async processEvent(data: any):Promise<void>{
        console.log(data.buildNetID);
        await this.buildSystem.PreperForBuilding(data.playerID, data.worldPos, data.buildNetID)
    }

    cancelEvent(playerID:string):boolean{
        this.buildSystem.CancelPrepearingForBuilding(playerID);

        return true;
    }
    
}
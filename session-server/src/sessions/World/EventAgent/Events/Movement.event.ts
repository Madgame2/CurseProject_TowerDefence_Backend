import { Vector3 } from "src/types/Vector3";
import { Player, PlayerStates } from "../../Entities/Player";
import { IPlayerEvent } from "../IEvent";
import { MovementService } from "../../MovementService/MovementService";




export class MovementEvent implements IPlayerEvent{
 
    constructor(private player:Player,private movementService:MovementService){}

    async processEvent(data: any):Promise<void>{
            console.log(data);
            const target: Vector3 = new Vector3(data.worldPos.x, 0, data.worldPos.y);

            if(this.player!.state == PlayerStates.BLOCKED_ADN_HIDE) return;

            this.movementService.setMoveTarget(
                this.player.id,
                target
            );
    }

    cancelEvent(playerID:string):boolean{

        return true;
    }
    
}
import { Vector2 } from "src/types/Vector2";
import { Player } from "../Entities/Player";
import { IPlayerEvent } from "./IEvent";

export enum PlayerEventType{

    RUNNING = "RUNNING",
    RUN_TO_BUILD = "RUN_TO_BUILD"
}



export class EventAgent{

    private currentEvent: IPlayerEvent|null = null;
    private events: Map<PlayerEventType, IPlayerEvent> = new Map<PlayerEventType, IPlayerEvent> ()

    constructor(private readonly playerId: string){}


    public StartBuildingEvent(WorldPos:Vector2, buildNetID: number){

        console.log(buildNetID);
        if(this.currentEvent) {
            const result = this.currentEvent.cancelEvent(this.playerId)
            if(!result){
                return;
            }
        }
        this.currentEvent = this.events[PlayerEventType.RUN_TO_BUILD]
        this.currentEvent?.processEvent({playerID:this.playerId , worldPos: WorldPos, buildNetID: buildNetID})
    }


    public linkType_Emiter(type: PlayerEventType, playerEvent: IPlayerEvent){
        this.events[type] = playerEvent;
    }
}
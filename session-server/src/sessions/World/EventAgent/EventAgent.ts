import { Vector2 } from "src/types/Vector2";
import { Player } from "../Entities/Player";
import { IPlayerEvent } from "./IEvent";

export enum PlayerEventType{
    MOVE_TO = "MOVE_TO",
    RUNNING = "RUNNING",
    RUN_TO_BUILD = "RUN_TO_BUILD"
}



export class EventAgent{

    private currentEvent: IPlayerEvent|null = null;
    private events: Map<PlayerEventType, IPlayerEvent> = new Map<PlayerEventType, IPlayerEvent> ()

    constructor(private readonly playerId: string){}

    public MoveToEvent(WorldPos:Vector2){
        if(this.currentEvent) {
            const result = this.currentEvent.cancelEvent(this.playerId)
            if(!result){
                return;
            }
        }
        this.currentEvent = this.events[PlayerEventType.MOVE_TO];
        this.currentEvent?.processEvent({playerID:this.playerId , worldPos: WorldPos})
    }

    public StartBuildingEvent(WorldPos:Vector2, buildNetID: number){
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
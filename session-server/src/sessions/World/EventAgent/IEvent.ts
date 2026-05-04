

export interface IPlayerEvent {
    processEvent(data:any):Promise<void>;
    cancelEvent(playerId: string):boolean;
}
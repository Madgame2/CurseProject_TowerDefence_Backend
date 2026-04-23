
export enum LobbyEventType {
    REQUEST_TO_JOIN = "REQUEST_TO_JOIN"
}

export class LobbyServerEvent{
    serverSenderID?: string; 
    eventType!: LobbyEventType;
    payload: any;
}
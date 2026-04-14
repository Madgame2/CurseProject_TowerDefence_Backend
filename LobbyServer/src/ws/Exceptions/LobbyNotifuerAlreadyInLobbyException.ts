export class LobbyNotifuerAlreadyInLobbyException extends Error {
    constructor(public lobbyId: string) {
        super();
        this.name = "LobbyNotifuerAlreadyInLobbyException";
        this.lobbyId = lobbyId;
    }
}
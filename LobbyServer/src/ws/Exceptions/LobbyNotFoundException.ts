export class LobbyNotFoundException extends Error {
    constructor(public lobbyId: string) {
        super(`Lobby ${lobbyId} not found`);
        this.name = "LobbyNotFoundException";
    }
}
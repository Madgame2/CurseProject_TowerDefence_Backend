export class LobbyNotFoundException extends Error {
    public lobbyId?: string;

    constructor(lobbyId?: string) {
        if (lobbyId) {
            super(`Lobby ${lobbyId} not found`);
            this.lobbyId = lobbyId;
        } else {
            super(`Lobby not found`);
        }

        this.name = "LobbyNotFoundException";
    }
}
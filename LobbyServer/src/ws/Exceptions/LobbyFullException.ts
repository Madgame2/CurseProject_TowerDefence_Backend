export class LobbyFullException extends Error {
    constructor(public lobbyId: string, public maxSize: number) {
        super(`Lobby ${lobbyId} is full. Max size is ${maxSize}`);
        this.name = "LobbyFullException";
    }
}

export class WrongLobbyHostException extends Error {
    constructor() {
        super();
        this.name = "WrongLobbyHostException";
    }
}
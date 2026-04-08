

export class UserAlreadInLobbyException extends Error{
    public userID:string;
    public LobbyId:string
    constructor(userID:string, LobbyId:string){
        super()
        this.userID = userID;
        this.LobbyId=LobbyId;
    }
}
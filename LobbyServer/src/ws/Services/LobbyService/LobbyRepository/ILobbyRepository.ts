import { Lobby } from "../../../types/Lobby";


export interface ILobbyRepository {
    getUserLobby(userId: string): Promise<string | null>;
    getLobbyUsers(lobbyId: string): Promise<string[]>;
    isUserInLobby(userId: string): Promise<boolean>;
    getLobbyHost(lobbyId: string): Promise<string | null>;
    setLobbyHost(lobbyId: string, userId: string): Promise<void>;
    getLobbyInviteCode(lobbyId: string): Promise<string| null>;
    addUserToLobby(lobbyId: string, userId: string): Promise<void>;
    removeUserFromLobby(lobbyId: string, userId: string): Promise<void>;
    deleteLobby(lobbyId: string): Promise<void>
    getLobbyheaderImage(LobbyID:string):Promise<string|null>
    getLobbyNickName(LobbyID:string):Promise<string|null>

    getLobby(lobbyId: string): Promise<Lobby | null>;
    getUserLobbyObj(userId: string): Promise<Lobby | null>;
}
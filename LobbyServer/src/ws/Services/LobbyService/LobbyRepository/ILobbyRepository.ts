import { Lobby } from "../../../types/Lobby";


export interface ILobbyRepository {
    getUserLobby(userId: string): Promise<string | null>;
    getLobbyUsers(lobbyId: string): Promise<string[]>;
    isUserInLobby(userId: string): Promise<boolean>;
    getLobbyHost(lobbyId: string): Promise<string | null>;
    setLobbyHost(lobbyId: string, userId: string): Promise<void>;
    addUserToLobby(lobbyId: string, userId: string): Promise<void>;
    removeUserFromLobby(lobbyId: string, userId: string): Promise<void>;
    deleteLobby(lobbyId: string): Promise<void>

    getLobby(lobbyId: string): Promise<Lobby | null>;
    getUserLobbyObj(userId: string): Promise<Lobby | null>;
}
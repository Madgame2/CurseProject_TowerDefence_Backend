import { Lobby } from "./Lobby";
import { IEvent } from "../Services/NotifySustem/Events/iEvent";

export type LobbyEvent =
    | (IEvent & {
        type: "LOBBY_CREATED";
        lobby: Lobby | null;
        lobbyId: string;
    })
    | (IEvent & {
        type: "LOBBY_UPDATED";
        lobby: Lobby | null;
        lobbyId: string;
    })
    | (IEvent & {
        type: "LOBBY_DELETED";
        lobby: Lobby | null;
        lobbyId: string;
    })
    | (IEvent & {
        type: "LOBBY_STATE_UPDATE";
        lobby: Lobby | null;
        lobbyId: string;
        state: string
    })    
    | (IEvent & {
        type: "LOBBY_PLAYER_JOINED";
        lobbyId: string;
        lobby: Lobby | null;
        userId: string;
    })
    | (IEvent & {
        type: "LOBBY_PLAYER_LEFT";
        lobbyId: string;
        lobby: Lobby | null;
        userId: string;
    })
    | (IEvent & {
        type: "LOBBY_HOST_CHANGED";
        lobbyId: string;
        lobby: Lobby | null;
        newHostId: string;
    })
    | (IEvent & {
        type: "LOBBY_DELETED";
        lobbyId: string;
        lobby: Lobby | null;
    })
    | (IEvent & {
        type: "LOBBY_STATE_SYNC";
        lobbyId: string;
        lobby: Lobby;
    });
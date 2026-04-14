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
    });
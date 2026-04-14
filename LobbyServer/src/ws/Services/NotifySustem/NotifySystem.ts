import { LobbyNotifier } from "./LobbyNotifier/LobbyNotifier";
import { lobbyStorage } from "../LobbyService/LobbyStorage/LobbyStorage";
import { ClientManager } from "../../modules/ClientManager";
import { IEvent } from "./Events/iEvent";
import { LobbyEvent } from "../../types/LobbyEvent";
import { Notifier } from "./INotifier";

const clientManager = ClientManager.getInstance();
const lobbyNotifier = new LobbyNotifier();

type EventMap = {
    LOBBY_CREATED: Extract<LobbyEvent, { type: "LOBBY_CREATED" }>;
    LOBBY_UPDATED: Extract<LobbyEvent, { type: "LOBBY_UPDATED" }>;
    LOBBY_DELETED: Extract<LobbyEvent, { type: "LOBBY_DELETED" }>;

    // потом добавишь другие:
    // USER_CONNECTED: UserEvent
};


const notifierMap: {
    [K in keyof EventMap]?: Notifier<EventMap[K]>;
} = {
    LOBBY_CREATED: lobbyNotifier,
    LOBBY_UPDATED: lobbyNotifier,
    LOBBY_DELETED: lobbyNotifier,
};



export async function initNotifySystem() {
    await lobbyStorage.init();
}

export async function Notify(event:IEvent){
    const notifier = notifierMap[event.type as keyof EventMap];

    if (!notifier) {
        console.warn("No notifier for event", event.type);
        return;
    }

    await notifier.emit(event as any);
}

export function removeUserFromAllNotifiers(userId: string) {
    for (const notifier of Object.values(notifierMap)) {
        notifier.removeUserFromAllSubscriptions?.(userId);
    }
}

export {
    clientManager,
    lobbyNotifier
};
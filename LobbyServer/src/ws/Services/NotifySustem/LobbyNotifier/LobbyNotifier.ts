
import { LobbyNotifuerAlreadyInLobbyException } from "../../../Exceptions/LobbyNotifuerAlreadyInLobbyException";
import { clientManager } from "../NotifySystem";
import { LobbyEvent } from "../../../types/LobbyEvent";
import { Notifier } from "../INotifier";
import { LobbyService } from "../../LobbyService/Lobby.Service";
import { WSEvent } from "../../../../types/WSEvent";
import { WSResponse } from "../../../../types/WSResponse";

export class LobbyNotifier implements Notifier<LobbyEvent> {

    // UserID -> LobbyID
    private userToLobby = new Map<string, string>();

    // LobbyID -> Set<UserID>
    private lobbyToUsers = new Map<string, Set<string>>();

    private globalSubscribers = new Set<string>();

    // 🔹 Подписка на лобби
    public subscribeOnLobbyUpdates(userId: string, lobbyId: string) {
        const currentLobby = this.userToLobby.get(userId);

        // уже подписан на это же лобби
        if (currentLobby === lobbyId) return;

        // если был в другом лобби → отписываем
        if (currentLobby) {
            this.unsubscribeUserFromLobbyLocalUpdates(userId);
        }

        // добавляем связь user → lobby
        this.userToLobby.set(userId, lobbyId);

        // добавляем в lobby → users
        if (!this.lobbyToUsers.has(lobbyId)) {
            this.lobbyToUsers.set(lobbyId, new Set());
        }

        this.lobbyToUsers.get(lobbyId)!.add(userId);
    }

    // 🔹 Отписка от лобби
    public unsubscribeUserFromLobbyLocalUpdates(userId: string) {
        const lobbyId = this.userToLobby.get(userId);
        if (!lobbyId) return;

        this.userToLobby.delete(userId);

        const users = this.lobbyToUsers.get(lobbyId);
        if (users) {
            users.delete(userId);

            // если никого не осталось — чистим
            if (users.size === 0) {
                this.lobbyToUsers.delete(lobbyId);
            }
        }
    }

    // 🔹 Глобальные подписки
    public subscribeToGlobalEvents(userId: string) {
        this.globalSubscribers.add(userId);

        console.log(this.globalSubscribers);
    }

    public unsubscribeUserFromGlobalEvents(userId: string) {
        this.globalSubscribers.delete(userId);
    }

    // 🔥 Получить всех подписчиков лобби
    public getLobbySubscribers(lobbyId: string): string[] {
        return Array.from(this.lobbyToUsers.get(lobbyId) ?? []);
    }

    // 🔥 Получить глобальных
    public getGlobalSubscribers(): string[] {
        return Array.from(this.globalSubscribers);
    }


private sendSafe(userId: string, event: LobbyEvent, action: string): boolean {
    const context = clientManager.get(userId);

    console.log("send to: ", userId);
    if (!context || context.ws.readyState !== WebSocket.OPEN) {
        return false;
    }

    const result: WSResponse = { code:200, action: action, data: event };
    context.ws.send(JSON.stringify(result));
    return true;
}

public async emit(event: LobbyEvent) {
    const deadGlobalUsers: string[] = [];

    // 🔹 Глобальные подписчики
    console.log("LobbysNofifaer")
    console.log(this.globalSubscribers);

    for (const userId of this.globalSubscribers) {
        if (!this.sendSafe(userId, event, "LobbysUpdated")) {
            deadGlobalUsers.push(userId);
        }
    }

    // чистим мертвых
    for (const userId of deadGlobalUsers) {
        this.globalSubscribers.delete(userId);
    }

    // 🔹 Подписчики лобби
    const users = this.lobbyToUsers.get(event.lobbyId);
    if (!users) return;

    const deadLobbyUsers: string[] = [];

    for (const userId of users) {
        if (!this.sendSafe(userId, event, "LobbysUpdated")) {
            deadLobbyUsers.push(userId);
        }
    }

    // чистим мертвых из лобби
    for (const userId of deadLobbyUsers) {
        this.unsubscribeUserFromLobbyLocalUpdates(userId);
    }
}


public removeUserFromAllSubscriptions(userId: string) {
    // 🔹 убрать из глобальных подписок

    console.log("ДО",this.globalSubscribers);

    this.globalSubscribers.delete(userId);

    // 🔹 убрать из user -> lobby мапы
    const lobbyId = this.userToLobby.get(userId);
    if (lobbyId) {
        this.userToLobby.delete(userId);

        // 🔹 убрать из lobby -> users
        const users = this.lobbyToUsers.get(lobbyId);
        if (users) {
            users.delete(userId);

            // если лобби пустое — чистим
            if (users.size === 0) {
                this.lobbyToUsers.delete(lobbyId);
            }
        }
    }

    console.log("AFTER ",this.globalSubscribers);
}
}
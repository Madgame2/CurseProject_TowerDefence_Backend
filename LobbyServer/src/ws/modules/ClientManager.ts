import WebSocket from "ws";
import { WSContext } from "../types/WSContext";

export class ClientManager {
    private static instance: ClientManager;
    private clients = new Map<string, WSContext>();

    private constructor() {}

    static getInstance(): ClientManager {
        if (!ClientManager.instance) {
            ClientManager.instance = new ClientManager();
        }
        return ClientManager.instance;
    }

    addClient(ctx: WSContext) {
        this.clients.set(ctx.userId!, ctx);
    }

    get(userId: string): WSContext | null {
        return this.clients.get(userId) ?? null;
    }

    removeClient(userId: string) {
        this.clients.delete(userId);
    }

    forEach(callback: (ctx: WSContext) => void) {
        this.clients.forEach(callback);
    }
}
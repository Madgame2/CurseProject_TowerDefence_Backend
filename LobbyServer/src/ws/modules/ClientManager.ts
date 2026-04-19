import WebSocket from "ws";
import { WSContext } from "../types/WSContext";
import { redis } from "../../config/redis.config";

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

    async addClient(ctx: WSContext) {
        await redis.set(`user:${ctx.userId!}:server`, process.env.SERVER_ID!)
        this.clients.set(ctx.userId!, ctx);
    }

    get(userId: string): WSContext | null {
        return this.clients.get(userId) ?? null;
    }

    async removeClient(userId: string) {
        await redis.del(`user:${userId!}:server`);
        this.clients.delete(userId);
    }

    forEach(callback: (ctx: WSContext) => void) {
        this.clients.forEach(callback);
    }
}
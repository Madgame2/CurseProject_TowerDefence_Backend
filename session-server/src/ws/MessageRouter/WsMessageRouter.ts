import { WSContext } from "../Types/WsContext";
import { WSResponse } from "../Types/WSResponse";

// ws-message-router.ts
export class WsMessageRouter {
    private listeners = new Map<string, ((msg: any) => void)[]>();
    private pendingRequests = new Map<string, (msg: any) => void>();
    private rpcHandlers = new Map<string, (ctx: WSContext) => any>();


    constructor(private ws: any) {
        this.ws.on("message", this.handleMessage.bind(this));
    }

public handleMessage(ctx: WSContext) {

    const msg = ctx.message;
    if (!msg) return;

    // 1. RESPONSE (server replied to our request)
    if (msg.requestId && this.pendingRequests.has(msg.requestId)) {
        const resolver = this.pendingRequests.get(msg.requestId)!;
        this.pendingRequests.delete(msg.requestId);
        resolver(msg);
        return;
    }

    // 2. REQUEST (incoming RPC from client)
    if (msg.requestId) {
        this.handleIncomingRpc(ctx);
        return;
    }

    // 3. EVENT
    if (msg.action) {
        const handlers = this.listeners.get(msg.action);
        handlers?.forEach(h => h(msg));
    }
}

    onRpc(action: string, handler: (ctx: WSContext) => any) {
        this.rpcHandlers.set(action, handler);
    }

    private handleIncomingRpc(ctx: WSContext) {
        const msg = ctx.message!;
        const handler = this.rpcHandlers.get(msg.action);

        if (!handler) return;

        const result = handler(ctx);

        // отправляем response обратно
        const send: WSResponse = {code: 200, requestId:msg.requestId, data: result }
        this.ws.send(JSON.stringify(send));
    }

    sendRequest(action: string, payload: any): Promise<any> {
        const requestId = crypto.randomUUID();

        this.ws.send(JSON.stringify({
            action,
            requestId,
            payload
        }));

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error("Timeout"));
            }, 5000);

            this.pendingRequests.set(requestId, (msg) => {
                clearTimeout(timer);
                resolve(msg);
            });
        });
    }

    on(action: string, handler: (msg: any) => void) {
        const arr = this.listeners.get(action) || [];
        arr.push(handler);
        this.listeners.set(action, arr);
    }

    off(action: string, handler: (msg: any) => void) {
        const arr = this.listeners.get(action) || [];
        this.listeners.set(action, arr.filter(h => h !== handler));
    }

    waitFor(action: string, timeout = 5000): Promise<any> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error("Timeout"));
            }, timeout);

            const handler = (msg: any) => {
                cleanup();
                clearTimeout(timer);
                resolve(msg);
            };

            const cleanup = () => {
                const arr = this.listeners.get(action) || [];
                this.listeners.set(action, arr.filter(h => h !== handler));
            };

            const arr = this.listeners.get(action) || [];
            arr.push(handler);
            this.listeners.set(action, arr);
        });
    }

    destroy() {
        this.listeners.clear();
        this.ws.removeAllListeners("message");
        this.ws.removeAllListeners("close");
        this.ws.removeAllListeners("error");
    }
}
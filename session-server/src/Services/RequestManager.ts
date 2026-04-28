import { WSResponse } from "src/ws/Types/WSResponse";

export class RequestManager {
    private pending = new Map<string, {
        resolve: (data: any) => void,
        reject: (err: any) => void,
        timeout: NodeJS.Timeout
    }>();

    constructor(private sendFn: (data: any) => void) {}

    send<T = any>(type: string, payload: any, timeoutMs = 5000): Promise<T> {
        return new Promise((resolve, reject) => {

            const requestId = crypto.randomUUID();

            const timeout = setTimeout(() => {
                if (this.pending.has(requestId)) {
                    this.pending.delete(requestId);
                    reject(new Error("Timeout"));
                }
            }, timeoutMs);

            this.pending.set(requestId, { resolve, reject, timeout });

            this.sendFn({
                code: 200,
                action: type,   // вместо type
                requestId,
                data: payload
            });
        });
    }

handleMessage(msg: WSResponse) {
    const { requestId, data, code, message } = msg;

    if (!requestId) return;

    const pending = this.pending.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pending.delete(requestId);

    if (code !== 0) {
        // ошибка с сервера
        pending.reject(new Error(message || "Unknown error"));
        return;
    }

    pending.resolve(data);
}
}

// ws-message-router.ts
export class WsMessageRouter {
    private listeners = new Map<string, ((msg: any) => void)[]>();

    constructor(private ws: any) {
        this.ws.on("message", this.handleMessage.bind(this));
    }

    private handleMessage(data: any) {
        const message = JSON.parse(data.toString());
        const handlers = this.listeners.get(message.action);

        if (handlers) {
            handlers.forEach(h => h(message));
        }
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
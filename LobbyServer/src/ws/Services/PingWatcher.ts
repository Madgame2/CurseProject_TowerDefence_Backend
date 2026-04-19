import { ClientManager } from "../modules/ClientManager";

export class PingWatcher {
    private interval?: NodeJS.Timeout;

    start() {
        const clientManager = ClientManager.getInstance();

        this.interval = setInterval(() => {
            clientManager.forEach(ctx => {
                if ((Date.now() - ctx.lastPing) > 90000) {
                    console.log("Disconnect by server, no ping");
                    ctx.ws.terminate();
                }
            });
        }, 10000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}
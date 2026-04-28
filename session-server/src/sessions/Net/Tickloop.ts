


export class TickLoop{
    private interval?: NodeJS.Timeout;

    constructor(private tickRate: number) {}

    start(onTick: (delta: number) => void) {
        const intervalMs = 1000 / this.tickRate;

        this.interval = setInterval(() => {
            const deltaSeconds = intervalMs / 1000;
            onTick(deltaSeconds);
        }, intervalMs);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }

}
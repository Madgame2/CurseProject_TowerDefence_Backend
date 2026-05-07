


export class TickLoop{
    private interval?: NodeJS.Timeout;

    constructor(private tickRate: number) {}

    start(onTick: (delta: number) => void) {

        const intervalMs = 1000 / this.tickRate;

        let lastTime = performance.now();

        this.interval = setInterval(() => {

            const now = performance.now();

            const deltaSeconds = (now - lastTime) / 1000;

            lastTime = now;

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
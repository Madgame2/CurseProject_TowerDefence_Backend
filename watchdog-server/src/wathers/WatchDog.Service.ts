import { Injectable, Logger } from "@nestjs/common";
import { IWatcher } from "./IWatcher";
import { Interval } from "@nestjs/schedule";
import { Inject } from "@nestjs/common";
import { WATCHERS } from "./tokens";

@Injectable()
export class WatchdogService {
    private readonly logger = new Logger(WatchdogService.name);

    constructor(
        @Inject(WATCHERS) private readonly watchers: IWatcher[],
    ) {}

    @Interval(5000)
    async Tick(){
        this.logger.log("Watchdog tick start");

        const tasks = this.watchers.map(async (w) => {
            try {
                await w.run();
            } catch (err) {
                this.logger.error(`Watcher ${w.name} failed`, err);
            }
        });

        await Promise.all(tasks);

        this.logger.log("Watchdog tick end");
    }
}
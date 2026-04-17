import { Module } from "@nestjs/common";
import { MatchmakingWorker } from "./MatchmakingWorker";


@Module({
    providers:[MatchmakingWorker],
    exports: [MatchmakingWorker]
})
export class MatchmakingModule{}
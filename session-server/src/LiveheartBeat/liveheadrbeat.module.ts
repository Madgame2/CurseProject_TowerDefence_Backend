import { Module } from "@nestjs/common"
import { LiveHeatBeatService } from "./liveheartBeat.service";



@Module({
    providers: [LiveHeatBeatService],
    exports: [LiveHeatBeatService]
})
export class LiveHeatBeatModule{}
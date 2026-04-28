import { Module } from "@nestjs/common";
import { WorldSimulationService } from "./WorldSimulation.service";

@Module({

    providers: [WorldSimulationService],
    exports: [WorldSimulationService]
})
export class WorldSimulationModule{}   
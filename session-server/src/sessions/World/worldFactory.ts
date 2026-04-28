import { Injectable } from "@nestjs/common";
import { promises } from "dns";
import { World } from "./Entities/World";
import { ChankManager } from "./Chanks/ChunkManager";
import { RenderPipline } from "./RenderPipline/RenderPipline";
import { Player } from "./Entities/Player";
import { MovementService } from "./MovementService/MovementService";
import { WorldSimulationService } from "./WorldSimulation/WorldSimulation.service";


@Injectable()
export class WorldFactory{

    async createWorld(seed:number):Promise<World>{
        const newWorld = new World;
        const renderPipline = new RenderPipline(seed);
        const chankManager = new ChankManager(renderPipline);
        const movementService = new MovementService(newWorld)
        const worldSimulationService = new WorldSimulationService(newWorld)

        newWorld.setSystems(chankManager,movementService,worldSimulationService);
        chankManager.preloadArea(0,0,4);
        
        return newWorld
    }
}
import { Injectable } from "@nestjs/common";
import { promises } from "dns";
import { World } from "./Entities/World";
import { ChankManager } from "./Chanks/ChunkManager";
import { RenderPipline } from "./RenderPipline/RenderPipline";
import { Player } from "./Entities/Player";
import { MovementService } from "./MovementService/MovementService";
import { WorldSimulationService } from "./WorldSimulation/WorldSimulation.service";
import { PlayerFactory } from "./PlayerFactory/PlayerFactory";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class WorldFactory{

    constructor(private readonly configService: ConfigService){}

    async createWorld(seed:number):Promise<World>{
        const newWorld = new World;
        const renderPipline = new RenderPipline(seed);
        const chankManager = new ChankManager(this.configService.get<number>('PORT') ?? 16,renderPipline);
        const movementService = new MovementService(newWorld)
        const worldSimulationService = new WorldSimulationService(newWorld)
        const playerFactory = new PlayerFactory(newWorld);

        newWorld.setSystems(chankManager,movementService,worldSimulationService,playerFactory);
        chankManager.preloadArea(0,0,4);
        
        return newWorld
    }
}
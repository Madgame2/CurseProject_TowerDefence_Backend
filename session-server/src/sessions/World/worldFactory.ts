import { Injectable } from "@nestjs/common";
import { promises } from "dns";
import { World } from "./Entities/World";
import { ChankManager } from "./Chanks/ChunkManager";
import { Player } from "./Entities/Player";
import { MovementService } from "./MovementService/MovementService";
import { WorldSimulationService } from "./WorldSimulation/WorldSimulation.service";
import { PlayerFactory } from "./PlayerFactory/PlayerFactory";
import { ConfigService } from "@nestjs/config";
import { StructureService } from "./Structures/StructService";
import { DecorationGenerator } from "./RenderPipline/DecorationGenerator";
import { StructureEntity } from "./Structures/StructureEntity";
import { RootHouse } from "./Structures/stuctures_imp/RootHouse.struct";


@Injectable()
export class WorldFactory{

    constructor(private readonly configService: ConfigService){}

    async createWorld(seed:number):Promise<World>{
        const newWorld = new World;
        const chankManager = new ChankManager(this.configService.get<number>('CHANK_SIZE') ?? 16);
        const StructService = new StructureService(newWorld.worldQuery, chankManager)
        const movementService = new MovementService(newWorld)
        const worldSimulationService = new WorldSimulationService(newWorld)
        const playerFactory = new PlayerFactory(newWorld);
        const decorationGenerator = new DecorationGenerator(seed,newWorld.worldQuery,StructService);

        chankManager.worldQuery = newWorld.worldQuery;
        newWorld.setSystems(chankManager,movementService,worldSimulationService,playerFactory,decorationGenerator);
        chankManager.preloadArea(0,0,4);
        const structEntity = decorationGenerator.PlaseRootHouse(RootHouse, 0,0);
        
        newWorld.rootStruct = structEntity!;

        return newWorld
    }
}
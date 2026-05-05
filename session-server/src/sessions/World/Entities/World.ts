import { ChankManager } from "../Chanks/ChunkManager";
import { MovementService } from "../MovementService/MovementService";
import { PlayerFactory } from "../PlayerFactory/PlayerFactory";
import { DecorationGenerator } from "../RenderPipline/DecorationGenerator";
import { StructureEntity } from "../Structures/StructureEntity";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { WorldSimulationService } from "../WorldSimulation/WorldSimulation.service";
import { Player } from "./Player";
import { StructureEntityWithHP } from "../Structures/StructureEntity";
import { PathfindingService } from "../NavSystem/PathfindingService";
import { BuildSystem } from "../BuildSystem/BuildSystem";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";
import { IEntity } from "../EntitiesSystem/IEntity";
import { EntitiesFactory } from "../EntitiesSystem/EnitiesFactory";

export class World{

    private players = new Map<string, Player>();
    private Entities = new  Map<string, IEntity>()

    rootStruct!: StructureEntityWithHP;

    chankManager!: ChankManager;
    movementService!: MovementService;
    worldSimulationService!: WorldSimulationService
    playerFactory!: PlayerFactory
    worldQuery: WorldQuery = new WorldQuery(this)
    worldGenerato!: DecorationGenerator
    pathfindingService!: PathfindingService
    builderSystem!: BuildSystem
    worldUpdatesStorage!: WorldUpdatesStorage
    entityFactory!:EntitiesFactory

    setSystems(chankManager: ChankManager,
        movementService: MovementService,
        worldSimulation: WorldSimulationService,
        playerFactory: PlayerFactory,
        worldGenerato: DecorationGenerator,
        pathfindingService: PathfindingService,
        builderSystem: BuildSystem,
        worldUpdatesStorage: WorldUpdatesStorage,
        entityFactory:EntitiesFactory){

        this.chankManager = chankManager;
        this.movementService = movementService;
        this.worldSimulationService = worldSimulation;
        this.playerFactory = playerFactory;
        this.worldGenerato = worldGenerato;
        this.pathfindingService = pathfindingService;
        this.builderSystem = builderSystem
        this.worldUpdatesStorage = worldUpdatesStorage
        this.entityFactory = entityFactory
    }

    getAllEnity():IEntity[]{
        return Array.from( this.Entities.values());
    }

    addEnity(entity: IEntity){
        this.Entities.set(entity.Id, entity);
    }

    removeEntity(id:string){
        this.Entities.delete(id);
    }

    addPlayer(player: Player) {
        this.players.set(player.id, player);
    }

    getPlayer(id: string): Player | undefined {
        return this.players.get(id);
    }

    getAllPlayers(): Player[] {
        return Array.from(this.players.values());
    }
}
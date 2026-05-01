import { ChankManager } from "../Chanks/ChunkManager";
import { MovementService } from "../MovementService/MovementService";
import { PlayerFactory } from "../PlayerFactory/PlayerFactory";
import { DecorationGenerator } from "../RenderPipline/DecorationGenerator";
import { StructureEntity } from "../Structures/StructureEntity";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { WorldSimulationService } from "../WorldSimulation/WorldSimulation.service";
import { Player } from "./Player";
import { StructureEntityWithHP } from "../Structures/StructureEntity";

export class World{

    private players = new Map<string, Player>();

    rootStruct!: StructureEntityWithHP;

    chankManager!: ChankManager;
    movementService!: MovementService;
    worldSimulationService!: WorldSimulationService
    playerFactory!: PlayerFactory
    worldQuery: WorldQuery = new WorldQuery(this)
    worldGenerato!: DecorationGenerator

    setSystems(chankManager: ChankManager,
        movementService: MovementService,
        worldSimulation: WorldSimulationService,
        playerFactory: PlayerFactory,
        worldGenerato: DecorationGenerator){

        this.chankManager = chankManager;
        this.movementService = movementService;
        this.worldSimulationService = worldSimulation;
        this.playerFactory = playerFactory;
        this.worldGenerato = worldGenerato;
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
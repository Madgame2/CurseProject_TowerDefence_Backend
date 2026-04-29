import { ChankManager } from "../Chanks/ChunkManager";
import { MovementService } from "../MovementService/MovementService";
import { PlayerFactory } from "../PlayerFactory/PlayerFactory";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { WorldSimulationService } from "../WorldSimulation/WorldSimulation.service";
import { Player } from "./Player";

export class World{

    private players = new Map<string, Player>();

    chankManager!: ChankManager;
    movementService!: MovementService;
    worldSimulationService!: WorldSimulationService
    playerFactory!: PlayerFactory
    worldQuery!: WorldQuery

    setSystems(chankManager: ChankManager,
        movementService: MovementService,
        worldSimulation: WorldSimulationService,
        playerFactory: PlayerFactory){

        this.chankManager = chankManager;
        this.movementService = movementService;
        this.worldSimulationService = worldSimulation;
        this.playerFactory = playerFactory;

        this.worldQuery = new WorldQuery(this);
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
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
import { INpc } from "../npc/INpc";
import { NpcEventType, NpcUpdatePacket } from "src/sessions/Net/models/NpcUpdatepakcet";
import { Vector2 } from "src/types/Vector2";
import { DirectorSystem } from "../DirectorSystem/DirectorSystem";

export class World{

    private players = new Map<string, Player>();
    private Entities = new  Map<string, IEntity>()
    private Npcs = new Map<string, INpc>()

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
    directorSystem!: DirectorSystem

    setSystems(chankManager: ChankManager,
        movementService: MovementService,
        worldSimulation: WorldSimulationService,
        playerFactory: PlayerFactory,
        worldGenerato: DecorationGenerator,
        pathfindingService: PathfindingService,
        builderSystem: BuildSystem,
        worldUpdatesStorage: WorldUpdatesStorage,
        entityFactory:EntitiesFactory,
        directorSystem: DirectorSystem){

        this.chankManager = chankManager;
        this.movementService = movementService;
        this.worldSimulationService = worldSimulation;
        this.playerFactory = playerFactory;
        this.worldGenerato = worldGenerato;
        this.pathfindingService = pathfindingService;
        this.builderSystem = builderSystem
        this.worldUpdatesStorage = worldUpdatesStorage
        this.entityFactory = entityFactory
        this.directorSystem = directorSystem
    }

    addNpc(npc: INpc){
        this.Npcs.set(npc.id, npc);

        const newPacket : NpcUpdatePacket ={
            type: "Npc",
            npcId: npc.id,
            enventType: NpcEventType.SPAWN,
            npcType: npc.type,
            data:{
                position: Vector2.zero(),
                behaver: npc.behaverType
            }
        }
        this.worldUpdatesStorage.add(newPacket);
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
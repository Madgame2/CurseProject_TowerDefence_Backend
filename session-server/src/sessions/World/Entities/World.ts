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
import { WaveSpawner } from "../WaveSpawner/WaveSpawner";
import { IAttackable } from "../EntitiesSystem/IAttackable";
import { BehaviorTypes } from "../npc/BehaviorTypes.enum";
import { EventEmitter } from "stream";

export class World{

    public events = new EventEmitter();

    private players = new Map<string, Player>();
    private Entities = new  Map<string, IEntity>()
    private Npcs = new Map<string, INpc>()
    private enemyNpcs = new Map<string, INpc>()

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
    waveSpawner!: WaveSpawner

    setSystems(chankManager: ChankManager,
        movementService: MovementService,
        worldSimulation: WorldSimulationService,
        playerFactory: PlayerFactory,
        worldGenerato: DecorationGenerator,
        pathfindingService: PathfindingService,
        builderSystem: BuildSystem,
        worldUpdatesStorage: WorldUpdatesStorage,
        entityFactory:EntitiesFactory,
        directorSystem: DirectorSystem,
        waveSpawner: WaveSpawner){

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
        this.waveSpawner  =waveSpawner
    }


    getAllEnemyNpcs():INpc[]{
        return Array.from(this.enemyNpcs.values());
    }

    getNpcsInRegion(center: Vector2, radius: number): INpc[] {

        const r2 = radius * radius;

        return Array.from(this.Npcs.values()).filter(npc => {

            const dx = npc.position.x - center.x;
            const dy = npc.position.y - center.y;

            return (dx * dx + dy * dy) <= r2;
        });
    }
    addNpc(npc: INpc) {
        this.Npcs.set(npc.id, npc);

        if (this.isAttackable(npc)) {
            npc.subscribeDeath(() => {
                this.removeNpc(npc.id);
            });
        }

        if(npc.behaverType == BehaviorTypes.ENEMY){
            this.enemyNpcs.set(npc.id, npc);
        }

        const newPacket: NpcUpdatePacket = {
            type: "Npc",
            npcId: npc.id,
            enventType: NpcEventType.SPAWN,
            npcType: npc.type,
            data: {
                position: npc.position,
                behaver: npc.behaverType
            }
        };

        this.worldUpdatesStorage.add(newPacket);
    }

    removeNpc(npcId: string) {
        const npc = this.Npcs.get(npcId);
        if (!npc) return;

        if(this.enemyNpcs.has(npcId)){
            this.enemyNpcs.delete(npcId);
        }

        this.Npcs.delete(npcId);

        const packet: NpcUpdatePacket = {
            type: "Npc",
            npcId: npc.id,
            enventType: NpcEventType.TERMINATE,
            npcType: npc.type,
            data: {
            }
        };

        this.worldUpdatesStorage.add(packet);
    }
    
    private isAttackable(npc: INpc): npc is INpc & IAttackable {
        return "subscribeDeath" in npc;
    }

    getAllNpc():INpc[]{
        return Array.from(this.Npcs.values());
    }

    getAllEnity(): IEntity[] {
        const rootHouse = this.rootStruct;
        return [rootHouse, ...this.Entities.values()];
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
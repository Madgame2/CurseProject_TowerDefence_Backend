import { NotAllowPlayerException } from "src/Exceptions/NotAllowPlayerException";
import { SessionDificulty } from "./Dificulty.enum";
import { SessionState } from "./SessionState.enum";
import { SessionStateMachine } from "src/sessions/sessionStateMachine.service";
import { EventEmitter } from "events";
import { CleanUpdSession } from "./CleanUpSession";
import { PlayerSyncManager } from "src/sessions/sessionManager/PlayerSyncManager";
import { SessionNotifier } from "src/sessions/SessionNotifier";
import { WSResponse } from "src/ws/Types/WSResponse";
import { TickLoop } from "src/sessions/Net/Tickloop";
import { World } from "src/sessions/World/Entities/World";
import { WorldFactory } from "src/sessions/World/worldFactory";
import { PlayerEventBinder } from "src/sessions/PlayerEventBinder/PlayerEventBinder";
import { Player } from "src/sessions/World/Entities/Player";
import { NetworkSysncService } from "src/sessions/Net/NetworkSyncService";
import { NpcFactory } from "src/sessions/World/npc/Factory/NpcFactory";
import { NpcTypes } from "src/sessions/World/npc/NpcTypes.enum";
import { BehaviorTypes } from "src/sessions/World/npc/BehaviorTypes.enum";

export class Session extends EventEmitter{
    SessionID!: string;
    Dificulty!: SessionDificulty;
    Seed!: number;
    Players: Set<string> = new Set();
    playersToConneced: Set<string> = new Set;
    onlinePlayersId: Set<string> = new Set();
    PassToken!: string;
    SessionState!: SessionState
    sessionNotifier: SessionNotifier
    worldFactory: WorldFactory
    playerEventBinder: PlayerEventBinder
    networkSyncService!: NetworkSysncService

    world!: World;

    private tickLoop  = new TickLoop(20);
    private waitingTimeout?: NodeJS.Timeout;
    private playerSyncManager: PlayerSyncManager;
    //private snapShotService: SnapshotService;

    currentTick:number = 0;

    private stateMachine: SessionStateMachine;

        constructor(
        id: string,
        difficulty: SessionDificulty,
        seed: number,
        passToken: string,
        players: string[],
        playerSyncManager :PlayerSyncManager,
        sessionNotifier: SessionNotifier,
        worldFactory: WorldFactory,
        playerEventBinder: PlayerEventBinder,
        networkSyncService: NetworkSysncService
    ) {
        super()
        this.SessionID = id;
        this.Dificulty = difficulty;
        this.Seed = seed;
        this.PassToken = passToken;
        this.SessionState =SessionState.NONE; 
        this.playerSyncManager = playerSyncManager;
        this.sessionNotifier = sessionNotifier;
        this.worldFactory = worldFactory;
        this.playerEventBinder = playerEventBinder;
        this.networkSyncService = networkSyncService;

        this.networkSyncService.session = this;

        for(var player of players){
            this.Players.add(player);
        }

        this.stateMachine = new SessionStateMachine(this)
        //this.snapShotService = new SnapshotService(this);
        this.setupStates();
    }

    StatemachineEmit(event: string) {
        this.stateMachine.handle(this, event);
    }

    private setupStates(){

        this.stateMachine.registerOnStateChange((session, from, to) => {
            if (to === SessionState.CREATING) {
                console.log("Session entered root state");
            }
            this.SessionState = to;
        });

        this.stateMachine.registerOnEnter(SessionState.CREATING, (session)=>{
            console.log("CREATING");
            session.waitingTimeout = setTimeout(()=>{
                    if(session.playersToConneced.size === 0){
                        console.log("TIMEOUT NO PLAYERS");
                        session.StatemachineEmit("no_players_timeout");
                    }else {
                        this.stateMachine.transition(this,SessionState.STARTING)
                    }
            },10000)
        })
        this.stateMachine.registerOnExit(SessionState.CREATING, (session)=>{
            if (session.waitingTimeout) {
                clearTimeout(session.waitingTimeout);
                session.waitingTimeout = undefined;
            }
        })

        this.stateMachine.registerHandler(SessionState.CREATING, "no_players_timeout", (session) => {
            console.log("NO PLAYERS");
            session.stateMachine.transition(session, SessionState.CANCELED);
        });

        this.stateMachine.registerHandler(SessionState.CREATING, "player_joined",(session)=>{
            console.log("PLAYER JOING");
        })

        this.stateMachine.registerHandler(SessionState.RUNNING, "player_leave",(session)=>{
            console.log(session.onlinePlayersId.size);
            if(session.onlinePlayersId.size === 0){
                console.log("ПЕРЕХОДИМ В ОТМЕНУ")
                this.stateMachine.transition(this,SessionState.CANCELED)
            }
        })

        this.stateMachine.registerOnEnter(SessionState.CANCELED,(session)=>{
            console.log("В отменне");
            this.cleanUp();
        })

        this.stateMachine.registerOnEnter(SessionState.STARTING, async (session)=>{
            this.world = await this.worldFactory.createWorld(this.Seed);
            const sucsesfuluInitedPalyers = await this.playerSyncManager.syncPlayers(this.world);

            sucsesfuluInitedPalyers.forEach((i)=>{
                this.onlinePlayersId.add(i)
            })
            

            this.stateMachine.transition(session, SessionState.RUNNING);
        })

        this.stateMachine.registerOnEnter(SessionState.RUNNING, (session)=>{
            
            this.playerEventBinder.bindAll(this.onlinePlayersId)

            const message:WSResponse = {code:200, action:"startSession"}
            this.sessionNotifier.broadcast(Array.from(this.onlinePlayersId), JSON.stringify(message));
            this.startTickLoop()
        })

        this.stateMachine.transition(this, SessionState.CREATING);
    }


    public addPlayer(playerId: string){
        if(!this.Players.has(playerId)) throw new NotAllowPlayerException(playerId);
        
        this.playersToConneced.add(playerId);
        this.playerSyncManager.addPalyerToConnection(playerId);
        this.StatemachineEmit("player_joined");
    }

    public removePlayer(playerId: string){
        console.log("Удаляю: ", playerId);
        if(!this.Players.has(playerId)) return;
        console.log("нашел: ", playerId);

        this.playersToConneced.delete(playerId);
        this.onlinePlayersId.delete(playerId);
        this.playerSyncManager.removePlayer(playerId);
        console.log("событие: ", playerId);
        this.StatemachineEmit("player_leave");
    }

    private startTickLoop() {

        setTimeout(()=>{
            const factory = new NpcFactory;
            const npc = factory.create(NpcTypes.SKELETON,BehaviorTypes.ENEMY);
            this.world.addNpc(npc);
        },10000);

        this.tickLoop.start((delta) => { 
            this.currentTick++;

            this.world.worldSimulationService.tick(delta);
            this.networkSyncService.update(delta);
        });
    }

    private stopTickLoop() {
        this.tickLoop.stop();
    }

    cleanUp(){
        this.stopTickLoop();
        const payLoad: CleanUpdSession = {sessionId: this.SessionID}
        this.emit("ended", payLoad)
    }
}
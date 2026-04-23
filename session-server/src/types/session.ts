import { NotAllowPlayerException } from "src/Exceptions/NotAllowPlayerException";
import { SessionDificulty } from "./Dificulty.enum";
import { SessionState } from "./SessionState.enum";
import { SessionStateMachine } from "src/sessions/sessionStateMachine.service";
import { EventEmitter } from "events";
import { CleanUpdSession } from "./CleanUpSession";
import { PlayerSyncManager } from "src/sessions/sessionManager/PlayerSyncManager";
import { SessionNotifier } from "src/sessions/SessionNotifier";
import { WSResponse } from "src/ws/Types/WSResponse";

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

    private waitingTimeout?: NodeJS.Timeout;

    private playerSyncManager: PlayerSyncManager;

    private stateMachine: SessionStateMachine;

        constructor(
        id: string,
        difficulty: SessionDificulty,
        seed: number,
        passToken: string,
        players: string[],
        playerSyncManager :PlayerSyncManager,
        sessionNotifier: SessionNotifier
    ) {
        super()
        this.SessionID = id;
        this.Dificulty = difficulty;
        this.Seed = seed;
        this.PassToken = passToken;
        this.SessionState =SessionState.NONE; 
        this.playerSyncManager = playerSyncManager
        this.sessionNotifier = sessionNotifier

        for(var player of players){
            this.Players.add(player);
        }

        this.stateMachine = new SessionStateMachine(this)
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
            },40000)
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

        this.stateMachine.registerOnEnter(SessionState.CANCELED,(session)=>{
            this.cleanUp();
        })

        this.stateMachine.registerOnEnter(SessionState.STARTING, async (session)=>{
            const sucsesfuluInitedPalyers = await this.playerSyncManager.syncPlayers();
            sucsesfuluInitedPalyers.forEach((i)=>this.onlinePlayersId.add(i))

            this.stateMachine.transition(session, SessionState.RUNNING);
        })

        this.stateMachine.registerOnEnter(SessionState.RUNNING, (session)=>{

            const message:WSResponse = {code:200, action:"startSession"}
            this.sessionNotifier.broadcast(Array.from(this.onlinePlayersId), JSON.stringify(message));
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
        if(!this.Players.has(playerId)) return;

        this.playersToConneced.delete(playerId);
        this.onlinePlayersId.delete(playerId);
        this.playerSyncManager.removePlayer(playerId);
        this.StatemachineEmit("player_leave");
    }


    cleanUp(){
        const payLoad: CleanUpdSession = {sessionId: this.SessionID}
        this.emit("ended", payLoad)
    }
}
import { NotAllowPlayerException } from "src/Exceptions/NotAllowPlayerException";
import { SessionDificulty } from "./Dificulty.enum";
import { SessionState } from "./SessionState.enum";
import { SessionStateMachine } from "src/sessions/sessionStateMachine.service";
import { EventEmitter } from "events";
import { CleanUpdSession } from "./CleanUpSession";

export class Session extends EventEmitter{
    SessionID!: string;
    Dificulty!: SessionDificulty;
    Seed!: number;
    Players: Set<string> = new Set();
    onlinePlayersId: Set<string> = new Set();
    PassToken!: string;
    SessionState!: SessionState

    private waitingTimeout?: NodeJS.Timeout;

    private stateMachine: SessionStateMachine;

        constructor(
        id: string,
        difficulty: SessionDificulty,
        seed: number,
        passToken: string,
        players: string[]
    ) {
        super()
        this.SessionID = id;
        this.Dificulty = difficulty;
        this.Seed = seed;
        this.PassToken = passToken;
        this.SessionState =SessionState.NONE; 

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
                    if(session.onlinePlayersId.size === 0){
                        console.log("TIMEOUT NO PLAYERS");
                        session.StatemachineEmit("no_players_timeout");
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



        this.stateMachine.transition(this, SessionState.CREATING);
    }


    public addPlayer(playerId: string){
        if(!this.Players.has(playerId)) throw new NotAllowPlayerException(playerId);
        
        this.onlinePlayersId.add(playerId);
        this.StatemachineEmit("player_joined");
    }

    public removePlayer(playerId: string){
        if(!this.Players.has(playerId)) return;

        this.onlinePlayersId.delete(playerId);
        this.StatemachineEmit("player_leave");
    }


    cleanUp(){
        const payLoad: CleanUpdSession = {sessionId: this.SessionID}
        this.emit("ended", payLoad)
    }
}
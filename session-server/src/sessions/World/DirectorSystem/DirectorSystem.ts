import { DireectorUpdatePacket } from "src/sessions/Net/models/DirectorUpdatePaket";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";


enum DirectorState {
    WAITING_START,
    RUNNING
}

export enum MatchPhase {
    PREPARATION = "PREPARATION",
    WAVE = "WAVE"
}


export class DirectorSystem{

    public phase: MatchPhase = MatchPhase.PREPARATION;

    public wave: number = 1;


    private state: DirectorState = DirectorState.WAITING_START;
    private startDelay: number = 3;

    private phaseTimer: number = 0;


    constructor(private eventBus: WorldUpdatesStorage){}


    Update(delta: number){

        switch (this.state) {

            case DirectorState.WAITING_START:

                this.startDelay -= delta;
                console.log(this.startDelay);
                if (this.startDelay <= 0) {
                    this.startGame();
                }

                break;

            case DirectorState.RUNNING:

                this.updateGame(delta);

                break;
        }
    }

    private startGame() {

        this.state = DirectorState.RUNNING;

        this.phase = MatchPhase.PREPARATION;

        this.phaseTimer = 30;

        const muthcUpdateData: DireectorUpdatePacket ={
            type: "Director",
            matchPahase: this.phase,
            data:{
                countdown: this.phaseTimer
            }
        }
        this.eventBus.add(muthcUpdateData);
    }


    private updateGame(delta){
        this.phaseTimer -= delta;

        console.log(this.phaseTimer);
        if (this.phaseTimer <= 0) {
            switch (this.phase) {
                case MatchPhase.PREPARATION:
                    this.startWave();
                    break;
            }
        }
    }
    
    private startWave() {

        this.phase = MatchPhase.WAVE;

        this.wave++;

        const message : DireectorUpdatePacket ={
            type: "Director",
            matchPahase: this.phase,
            data: {
                wave: this.wave
            }
        }
        this.eventBus.add(message);
    }
}
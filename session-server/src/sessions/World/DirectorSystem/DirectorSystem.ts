import { DireectorUpdatePacket } from "src/sessions/Net/models/DirectorUpdatePaket";
import { WorldUpdatesStorage } from "src/sessions/Net/models/WorldUpdateStorage";
import { WaveSpawner } from "../WaveSpawner/WaveSpawner";
import { EnemySpawnData, WaveConfig } from "../WaveSpawner/WaveConfig";
import { WorldQuery } from "../worldQuery/WorldQuery";
import { Vector2 } from "src/types/Vector2";
import { NpcTypes } from "../npc/NpcTypes.enum";
import { SessionDificulty } from "src/types/Dificulty.enum";


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

    public wave: number = 0;

    private state: DirectorState = DirectorState.WAITING_START;
    private startDelay: number = 3;

    private phaseTimer: number = 0;


    constructor(private eventBus: WorldUpdatesStorage,
        private waveSpawner: WaveSpawner,
        private worldQuery:WorldQuery,
        private difficulty: SessionDificulty){}


    Update(delta: number){

        switch (this.state) {

            case DirectorState.WAITING_START:

                this.startDelay -= delta;
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

        const enemys = this.worldQuery.getAllEnemies()
        if (this.phaseTimer <= 0&&enemys.length<=0 ) {
            switch (this.phase) {
                case MatchPhase.PREPARATION:
                    this.startWave();
                    break;
                case MatchPhase.WAVE:
                    this.startPrepare();
                break;
            }
        }
    }

    private startPrepare(){
        
        this.phase = MatchPhase.PREPARATION;

        this.phaseTimer =30;

        const muthcUpdateData: DireectorUpdatePacket ={
            type: "Director",
            matchPahase: this.phase,
            data:{
                countdown: this.phaseTimer
            }
        }
        this.eventBus.add(muthcUpdateData);
    }
    
    private startWave() {

        this.phase = MatchPhase.WAVE;

        this.wave++;

        const config = this.getConfig(this.wave);
        this.waveSpawner.startWave(config);

        this.phaseTimer = config.spawnDelay* (config.enemies.length -1);
        const message : DireectorUpdatePacket ={
            type: "Director",
            matchPahase: this.phase,
            data: {
                wave: this.wave
            }
        }
        this.eventBus.add(message);
    }

    private getDificultiMyltiply():number{
        console.log(this.difficulty);
        switch(this.difficulty){
            case SessionDificulty.Easy:
                return 1;
            case SessionDificulty.Normal:
                return 5;
            case SessionDificulty.Hard:
                return 10;
        }
    }

    getConfig(waveNum: number):WaveConfig{

        let enemies :EnemySpawnData[] = [];
        console.log(this.getDificultiMyltiply())
        const enemyCount = (5+ waveNum * 2)*this.getDificultiMyltiply() ;

        const rootHouseCenter = this.worldQuery.getRootHousePos();

        const spwawnPointCounts = Math.floor( 1 + waveNum*0.25);

        const spawnpoints: Vector2[] =[]
        for(let i = 0; i< spwawnPointCounts; i++){
            const spawnPoint = this.worldQuery.getRandomSpawnAround(rootHouseCenter,50,70);
            spawnpoints.push(spawnPoint);
        }


        for(let i=0; i<enemyCount;){
            for(const spawnPoint of spawnpoints){
                if(i>=enemyCount) break;

                const enemySpawnPos = this.worldQuery.getRandomSpawnAround(spawnPoint,0, 10);
                let type = NpcTypes.SKELETON;

                enemies.push({
                    type: type,
                    position: enemySpawnPos 
                })
                i++;
            }
        }

        return {
            enemies: enemies,
            spawnDelay: 2
        }
    }
}
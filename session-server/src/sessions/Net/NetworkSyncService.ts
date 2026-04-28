import { Session } from "src/types/session";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { WorldUpdatePaket } from "./models/WorldUpdatesPaket";
import { time } from "console";
import { PlayerState } from "./models/PlayerState";


export class NetworkSysncService{
    private accumulator = 0;
    private interval = 0.1; // 100 ms


    session!: Session;

    constructor(private playersregisty: ClientRegistryService){}

    update(delta: number) {
        this.accumulator += delta;
        if (this.accumulator >= this.interval) {
            this.accumulator = 0;

            this.broadcast();
        }
    }


    private broadcast() {
        const players = this.session.onlinePlayersId;

        for(var playerId of players){
            const clientConnection = this.playersregisty.getClient(playerId);
            if(!clientConnection) continue;

            const player = this.session.world.getPlayer(playerId)
            const PlayerState:PlayerState =  {id: player!.id,
                position: player!.position,
                rotation: player!.rotation,
                state: player!.state,
                velocity: player!.velocity}
            const paket : WorldUpdatePaket = new WorldUpdatePaket(
                {
                    tick: this.session.currentTick,
                    players: [PlayerState]
                }
            )
            clientConnection.ctx.ws.send(JSON.stringify(paket))
        }
    }
}
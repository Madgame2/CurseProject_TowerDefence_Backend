import { Session } from "src/types/session";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { WorldUpdatePaket } from "./models/WorldUpdatesPaket";
import { time } from "console";
import { PlayerState } from "./models/PlayerState";
import { WorldUpdatesStorage } from "./models/WorldUpdateStorage";
import { ChankUpdate } from "./models/ChankUpdate";
import { EnityEvent, EntityEventType } from "./models/EnityState";


export class NetworkSysncService{
    private accumulator = 0;
    private interval = 0.1; // 100 ms


    session!: Session;

    constructor(private playersregisty: ClientRegistryService
    ){}

    update(delta: number) {
        console.log("ОТПРАВИЛ ДАНЫНЕ");
        this.accumulator += delta;
        if (this.accumulator >= this.interval) {
            this.accumulator = 0;

            this.broadcast();
        }
    }


    private broadcast() {
    const playersIds = this.session.onlinePlayersId;

    // 1. Собираем состояния ВСЕХ игроков
    const playersStates: PlayerState[] = [];
    const chankUpdates: ChankUpdate[] =[]
    const enitiesEvnets: EnityEvent[] =[]
    for (const playerId of playersIds) {
        const player = this.session.world.getPlayer(playerId);
        if (!player) continue;

        playersStates.push({
            type: "playerState",
            id: player.id,
            position: player.position,
            rotation: player.rotation,
            state: player.state,
            velocity: player.velocity
        });
    }
    for(let update of this.session.world.worldUpdatesStorage.getAll()){
        switch(update.type){
            case "chunk":{
                chankUpdates.push(update as ChankUpdate);
                break;
            }
            case "Entity":{
                enitiesEvnets.push(update as EnityEvent);
                break;
            }
        }
    }
    for(const enitity of this.session.world.getAllEnity()){
        const payLoad =  enitity.getState()

        const newmessage :EnityEvent = {
            type: "Entity",
            enventType: EntityEventType.UPDATE,
            enityType: enitity.type,
            enityId: enitity.Id,
            data: payLoad
        }
        enitiesEvnets.push(newmessage);
    }

    // 2. Создаём ОДИН пакет со всеми игроками
    const paket: WorldUpdatePaket = new WorldUpdatePaket({
        tick: this.session.currentTick,
        players: playersStates,
        chanks: chankUpdates,
        enities: enitiesEvnets
    });

    const serialized = JSON.stringify(paket);

    // 3. Отправляем его КАЖДОМУ клиенту
    for (const playerId of playersIds) {
        const clientConnection = this.playersregisty.getClient(playerId);
        if (!clientConnection) continue;

        clientConnection.ctx.ws.send(serialized);
    }
}
}
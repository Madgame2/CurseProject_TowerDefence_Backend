import { Injectable } from "@nestjs/common";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { WSResponse } from "src/ws/Types/WSResponse";


@Injectable()
export class PlayerSyncManager {

    constructor(private readonly clients: ClientRegistryService){}

    private palyerToConnect : Set<string> = new Set;

    addPalyerToConnection(playerId:string){
        this.palyerToConnect.add(playerId);
    }

    removePlayer(playerId:string){
        if(this.palyerToConnect.has(playerId))
        this.palyerToConnect.delete(playerId);
    }

    async syncPlayers(): Promise<string[]> {
        const promises = Array.from(this.palyerToConnect).map(async (playerId) => {
            try {
                await this.syncPlayer(playerId);

                if(this.palyerToConnect.size != 0){
                    const connection = this.clients.getClient(playerId);

                    const sendAwaitmessage: WSResponse = {
                        code: 200,
                        action: "awaitOtherCleints"
                    };

                    connection?.ctx.ws.send(JSON.stringify(sendAwaitmessage));
                }
                
                return playerId; 
            } catch (err) {
                console.error(`Player ${playerId} failed`, err);
                return null; 
            }
        });

        const results = await Promise.all(promises);

        return results.filter((id): id is string => id !== null);
    }

    async syncPlayer(playerId: string){
        const playerContext = this.clients.getClient(playerId);

        if (!playerContext) {
            throw new Error(`Player ${playerId} not found`);
        }

        const SyncInitMessage:WSResponse = {code: 200, action: "sessionInstructions"}
        playerContext.ctx.ws.send(JSON.stringify(SyncInitMessage));
        console.log(`${playerId} - отправляю команду на синхранизацию`)

        await playerContext.router.waitFor("toSyncReady");
        console.log(`${playerId} - к синхранизации готов`)


        await this.SendAllMetaData()
        console.log(`${playerId} - все данные были доставленны`)

        const SyncFinishedMessage:WSResponse = {code: 200, action: "playerSyncFinished"}
        playerContext.ctx.ws.send(JSON.stringify(SyncFinishedMessage));
        console.log(`${playerId} - отправлено что все закончено`)

        this.palyerToConnect.delete(playerId);
    }


    private  async SendAllMetaData(){
    }
}
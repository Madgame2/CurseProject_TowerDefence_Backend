import { Injectable, RequestMapping } from "@nestjs/common";
import { RequestManager } from "src/Services/RequestManager";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { WSResponse } from "src/ws/Types/WSResponse";
import { World } from "../World/Entities/World";
import { Chank } from "../World/Chanks/Chank";
import { ClientConnection } from "src/ws/Types/ClientConnection";


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

    async syncPlayers(world:World): Promise<string[]> {
        const promises = Array.from(this.palyerToConnect).map(async (playerId) => {
            try {
                await this.syncPlayer(playerId, world);

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

    async syncPlayer(playerId: string, world:World){
        const playerContext = this.clients.getClient(playerId);

        if (!playerContext) {
            throw new Error(`Player ${playerId} not found`);
        }

        const SyncInitMessage:WSResponse = {code: 200, action: "sessionInstructions"}
        playerContext.ctx.ws.send(JSON.stringify(SyncInitMessage));
        console.log(`${playerId} - отправляю команду на синхранизацию`)

        await playerContext.router.waitFor("toSyncReady");
        console.log(`${playerId} - к синхранизации готов`)


        await this.SendAllMetaData(playerContext, world);
        console.log(`${playerId} - все данные были доставленны`)

        const SyncFinishedMessage:WSResponse = {code: 200, action: "playerSyncFinished"}
        playerContext.ctx.ws.send(JSON.stringify(SyncFinishedMessage));
        console.log(`${playerId} - отправлено что все закончено`)

        this.palyerToConnect.delete(playerId);
    }


    private  async SendAllMetaData(playerContext: ClientConnection, world: World){


        await this.MetaData(playerContext, world);

        await this.SendWorldData(playerContext, world);
    }

    private async SendWorldData(playerContext: ClientConnection, world: World){

        const rootChanks = world.chankManager.getRootChanks()

        for(var chank of rootChanks)
        {
            await this.sendChank(chank,playerContext)
        }
    }

    
    private async sendChank(chank:Chank,playerContext :ClientConnection){

        console.log ({x: chank.x, z: chank.z});
        const cend:WSResponse ={code:300, action:"chankPreload", data: {x: chank.x, z: chank.z}}
        playerContext.ctx.ws.send(JSON.stringify(cend))
        await playerContext.router.waitFor("chankApply");
    }

    private async MetaData(playerContext: ClientConnection, world: World){
        return;
    }
}
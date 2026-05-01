import { Injectable, RequestMapping } from "@nestjs/common";
import { RequestManager } from "src/Services/RequestManager";
import { ClientRegistryService } from "src/ws/ClientRegistry/ClientRegistry.service";
import { WSResponse } from "src/ws/Types/WSResponse";
import { World } from "../World/Entities/World";
import { Chank } from "../World/Chanks/Chank";
import { ClientConnection } from "src/ws/Types/ClientConnection";
import { Vector2 } from "src/types/Vector2";
import { WSMessage } from "src/ws/Types/WSMessage";
import { structNotifaer } from "../Net/StructNotifier";


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

        const synced = await this.syncClients(world);

        const spawned = await this.spawnPlayers(world, synced);

        const payload = this.buildPlayersPayload(world);

        await this.broadcastPlayersInit(world, spawned, payload);

        return spawned;
    }


    private async syncClients(world: World): Promise<string[]> {
        const synced = await Promise.all(
            Array.from(this.palyerToConnect).map(async (playerId) => {
                try {
                    await this.syncPlayer(playerId, world);

                    const connection = this.clients.getClient(playerId);

                    if (this.palyerToConnect.size > 1) {
                        const msg: WSResponse = {
                            code: 200,
                            action: "awaitOtherClients",
                        };

                        connection?.ctx.ws.send(JSON.stringify(msg));
                    }

                    return playerId;
                } catch (err) {
                    console.error(`Player ${playerId} failed sync`, err);
                    return null;
                }
            })
        );

        return synced.filter((id): id is string => id !== null);
    }

    private async spawnPlayers(world: World, playerIds: string[]): Promise<string[]> {
        const spawned = await Promise.all(
            playerIds.map(async (playerId) => {
                try {
                    const player = world.playerFactory.createNewPlayer(
                        playerId,
                        Vector2.zero(),
                        6
                    );

                    world.addPlayer(player);

                    return playerId;
                } catch (err) {
                    console.error(`Player ${playerId} failed spawn`, err);
                    return null;
                }
            })
        );

        return spawned.filter((id): id is string => id !== null);
    }

    private buildPlayersPayload(world: World) {
        return world.getAllPlayers().map((p) => ({
            playerId: p.id,
            hp: p.hp,
            position: p.position,
            rotation: p.rotation,
        }));
    }


    private async broadcastPlayersInit(
        world: World,
        playerIds: string[],
        payload: any
    ): Promise<void> {

        const message: WSResponse = {
            code: 200,
            action: "playersInit_metadata",
            data: payload,
        };

        await Promise.all(
            playerIds.map(async (playerId) => {
                try {
                    const client = this.clients.getClient(playerId);

                    client?.ctx.ws.send(JSON.stringify(message));

                    await client?.router.waitFor("meataDataApply");
                } catch (err) {
                    console.error(`Player ${playerId} failed metadata sync`, err);
                }
            })
        );
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

        await this.sencdRootEntity(world,playerContext);
    }

    
    private async sendChank(chank:Chank,playerContext :ClientConnection){
        //const chankEnityes = chank.getAllBlocksLocal()
        const cend:WSResponse ={code:300, action:"chankPreload", data: {x: chank.x, z: chank.z}}
        playerContext.ctx.ws.send(JSON.stringify(cend))
        await playerContext.router.waitFor("chankApply", 200000);
    }

    private async sencdRootEntity(world:World ,playerContext :ClientConnection){

        const rootEntity = world.rootStruct
        const nofifaer = new structNotifaer();

        const rootHouseInitObj = nofifaer.createNotifieObj(rootEntity);

        const send:WSResponse ={code:300, action:"EntityReg", data: rootHouseInitObj}
        console.log(send);
        playerContext.ctx.ws.send(JSON.stringify(send));

        await playerContext.router.waitFor("EntityApply", 200000);
    }

    private async MetaData(playerContext: ClientConnection, world: World){
        return;
    }
}
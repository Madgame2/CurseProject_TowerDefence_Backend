import { WSResponse } from "../../types/WSResponse";
import { WSContext } from "../types/WSContext";
import { redis } from "../../config/redis.config";
import { Lobbyreposiory } from "../Services/LobbyService/LobbyRepository/Imp/LobbyReposiotory.Redis";
import lobbyService from "../Services/LobbyService/Lobby.Service";
import { Lobby } from "../types/Lobby";

export const GetAvailableLobbies = async (ctx:WSContext)=>{
    try{
        console.log("Start Searching");
        const availabelLobbys:Lobby[] = await lobbyService.GetAvailableLobbys(ctx.userId!);
        console.log("result: ", availabelLobbys);

        const res:WSResponse = {requestId: ctx.requestId ,code:200, data: availabelLobbys}
        return ctx.ws.send(JSON.stringify(res));
    }catch(e){
        console.log("ERRR in getLobbys: ",e);

        const res: WSResponse  ={code:500, message:"Server error"}
        ctx.ws.send(JSON.stringify(res));
    }
}
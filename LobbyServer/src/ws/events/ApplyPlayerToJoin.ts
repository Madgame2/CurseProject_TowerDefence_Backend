import lobbyService from "../Services/LobbyService/Lobby.Service";
import { WSContext } from "../types/WSContext";


export const ApplyPlayerToJoin = async (ctx:WSContext)=>{
    const dto = ctx.message?.payload;

    try{
        await lobbyService.JoinToLobby_new(dto.UserId, dto.requestId, dto.LobbyId);
    }catch(ex){
        console.log(ex);
    }
}
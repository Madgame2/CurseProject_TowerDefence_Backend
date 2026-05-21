import lobbyService from "../Services/LobbyService/Lobby.Service";
import { WSContext } from "../types/WSContext";


export const LeaveFromLobby = async (ctx:WSContext)=>{
        
    try {
        const userId = ctx.userId!;
        if (!userId) {
            return;
        }
        await lobbyService.LeaveAndCreateLobby(userId);
    }
    catch (err) {
        console.error(err);
    }
}
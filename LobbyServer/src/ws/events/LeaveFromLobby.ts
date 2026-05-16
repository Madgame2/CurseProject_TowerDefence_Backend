import lobbyService from "../Services/LobbyService/Lobby.Service";
import { WSContext } from "../types/WSContext";


export const LeaveFromLobby = async (ctx:WSContext)=>{
        
    console.log("ПЫТАЮСЬ ВЫЙТИ ИЗ ЛОББИ");
    try {

        const userId = ctx.userId!;

        if (!userId) {

            console.log("НЕ НАШЕЛ");
            return;
        }


        await lobbyService.LeaveAndCreateLobby(userId);

    }
    catch (err) {

        console.error(err);

    }
}
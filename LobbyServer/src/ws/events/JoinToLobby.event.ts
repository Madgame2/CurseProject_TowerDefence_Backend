import { WSContext } from "../types/WSContext";
import { LobbyService } from "../Services/LobbyService/Lobby.Service";



export const JoinToLobby = async (ctx:WSContext)=>{
    const payload = ctx.message?.payload;
    const lobbyService = new LobbyService();

    if (!payload || typeof payload.newLobbyId !== "string") {
        const response = { code: 400, message: "Invalid payload" };
        ctx.ws.send(JSON.stringify(response));
        return;
    }

    const newLobbyId: string = payload.newLobbyId;

    try {
        const lobbyId = await lobbyService.joinLobby(ctx.userId!, newLobbyId);
        const response = { code: 200, data: { lobbyID: lobbyId } };
        ctx.ws.send(JSON.stringify(response));
    } catch (err) {
        const response = { code: 500, message: "Failed to join lobby" };
        ctx.ws.send(JSON.stringify(response));
    }

}
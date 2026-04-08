import { WSContext } from "../types/WSContext";
import { LobbyService } from "../Services/LobbyService/Lobby.Service";
import { WSResponse } from "../../types/WSResponse";
import { UserAlreadInLobbyException } from "../Exceptions/UserAlreadyInLobbyException";

export const CreateLobby = async (ctx: WSContext)=>{
    const lobbyService = new LobbyService();

    try {
        const lobbyId = await lobbyService.CreateLobby(ctx.userId!);

        const response: WSResponse = { code: 200, data: { lobbyID: lobbyId } };
        ctx.ws.send(JSON.stringify(response));
    } catch (e) {
        if (e instanceof UserAlreadInLobbyException) {
            const response: WSResponse = { code: 403, message: "already in lobby" };
            ctx.ws.send(JSON.stringify(response));
        } else {
            const response: WSResponse = { code: 500, message: "cannot create lobby" };
            ctx.ws.send(JSON.stringify(response));
        }
    }
}
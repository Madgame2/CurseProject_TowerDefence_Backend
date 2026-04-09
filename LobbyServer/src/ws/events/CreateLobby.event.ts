import { WSContext } from "../types/WSContext";
import { LobbyService } from "../Services/LobbyService/Lobby.Service";
import { WSResponse } from "../../types/WSResponse";
import { UserAlreadInLobbyException } from "../Exceptions/UserAlreadyInLobbyException";

export const CreateLobby = async (ctx: WSContext) => {
    const lobbyService = new LobbyService();

    try {
        console.log("trying createLobby");
        const lobby = await lobbyService.CreateLobby(ctx.userId!);

        const response: WSResponse = {
            requestId: ctx.requestId, 
            code: 200,
            data: { lobby: lobby }
        };

        console.log(response);
        ctx.ws.send(JSON.stringify(response));

    } catch (e) {
        if (e instanceof UserAlreadInLobbyException) {
            ctx.ws.send(JSON.stringify({
                requestId: ctx.requestId,
                code: 403,
                message: "already in lobby"
            }));
        } else {
            ctx.ws.send(JSON.stringify({
                requestId: ctx.requestId,
                code: 500,
                message: "cannot create lobby"
            }));
        }
    }
};
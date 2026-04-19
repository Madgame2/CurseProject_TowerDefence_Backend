import { WSContext } from "../types/WSContext";
import lobbyService from "../Services/LobbyService/Lobby.Service";
import { WSResponse } from "../../types/WSResponse";
import { UserAlreadInLobbyException } from "../Exceptions/UserAlreadyInLobbyException";
import { LobbyEvents } from "../Services/NotifySustem/Events/LobbyEvents";


export const CreateLobby = async (ctx: WSContext) => {

    try {
        console.log("requestID: ", ctx.requestId)
        const lobby = await lobbyService.CreateLobby(ctx.userId!);

        const res: WSResponse = {
            code:200,
            data:lobby,
            requestId: ctx.requestId
        }
        ctx.ws.send(JSON.stringify(res));
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
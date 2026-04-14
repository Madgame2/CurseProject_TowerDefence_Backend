import { WSResponse } from "../../types/WSResponse";
import { ILobbyRepository } from "../Services/LobbyService/LobbyRepository/ILobbyRepository";
import { Lobbyreposiory } from "../Services/LobbyService/LobbyRepository/Imp/LobbyReposiotory.Redis";
import { WSContext } from "../types/WSContext";
import { LobbyService } from "../Services/LobbyService/Lobby.Service";

export const getMyLobby = async (ctx: WSContext) => {
    
    console.log("tryGetMyLobby");
    try {
        const lobbyService :LobbyService = new LobbyService;
        const userId = ctx.userId;

        const lobby = await lobbyService.GetUserLobbyObj(userId!);
        
        if (!lobby) {
            const res: WSResponse = {
                code:404,
                message: "No lobby found for this user",
                requestId: ctx.requestId
            }
            ctx.ws.send(JSON.stringify(res));
            return;
        }

        const res: WSResponse = {
            code:200,
            data:lobby,
            requestId: ctx.requestId
        }
        ctx.ws.send(JSON.stringify(res));
    } catch (error) {
        console.error("Error in getMyLobby:", error);
        ctx.ws.send(JSON.stringify({
            code: 500,
            message: "Internal server error",
            requestId: ctx.requestId
        }));
    }
};
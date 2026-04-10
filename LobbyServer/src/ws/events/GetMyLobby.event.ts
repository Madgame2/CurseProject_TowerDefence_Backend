import { WSResponse } from "../../types/WSResponse";
import { ILobbyRepository } from "../Services/LobbyService/LobbyRepository/ILobbyRepository";
import { Lobbyreposiory } from "../Services/LobbyService/LobbyRepository/Imp/LobbyReposiotory.Redis";
import { WSContext } from "../types/WSContext";


export const getMyLobby = async (ctx: WSContext) => {
    
    console.log("tryGetMyLobby");
    try {
        const lobbyRepo: ILobbyRepository = new Lobbyreposiory();
        const userId = ctx.userId;

        const lobby = await lobbyRepo.getUserLobbyObj(userId!);
        console.log(lobby);
        
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
        console.log(res);
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
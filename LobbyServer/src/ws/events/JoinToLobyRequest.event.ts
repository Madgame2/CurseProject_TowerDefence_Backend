import { WSResponse } from "../../types/WSResponse";
import { WSContext } from "../types/WSContext";
import lobbyService from "../Services/LobbyService/Lobby.Service";
import { RequestJoinToLobbyDTO } from "../dto/RequestJoinToLobby";



export const joinToLobbyRequest = async( ctx: WSContext)=>{
    try{
        const requestData : RequestJoinToLobbyDTO = JSON.parse(ctx.message?.payload);
        


    }catch(ex){
        const resError :WSResponse = {code:500, requestId: ctx.requestId, message: "serverError"}
        ctx.ws.send(JSON.stringify(resError))
    }
}   


export const joinToLobbyByInviteCode = async (ctx: WSContext)=>{

}
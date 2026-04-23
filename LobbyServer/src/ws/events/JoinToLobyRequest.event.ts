import { WSResponse } from "../../types/WSResponse";
import { WSContext } from "../types/WSContext";
import lobbyService from "../Services/LobbyService/Lobby.Service";
import { RequestJoinToLobbyDTO } from "../dto/RequestJoinToLobby";
import { LobbyNotFoundException } from "../Exceptions/LobbyNotFoundException";
import { LobbyFullException } from "../Exceptions/LobbyFullException";



export const joinToLobbyRequest = async( ctx: WSContext)=>{
    try{
        console.log("Начинаю отправку сообшения");
        console.log(ctx.message);
        const requestData = ctx.message?.payload;
        console.log(requestData);
        lobbyService.sendRequestToJoin(ctx.userId! ,requestData.LobbyID)
        console.log("вроде отправил(");


        const responce :WSResponse = {code:200, requestId: ctx.requestId}
        ctx.ws.send(JSON.stringify(responce));
    }catch(ex){

        console.log(ex);
        if(ex instanceof LobbyNotFoundException){
            const resError :WSResponse = {code:404, requestId: ctx.requestId, message: "LobbyNotFound"}
            ctx.ws.send(JSON.stringify(resError))
        }else if(ex instanceof LobbyFullException){
            const resError :WSResponse = {code:403, requestId: ctx.requestId, message: "LobbyFull"}
            ctx.ws.send(JSON.stringify(resError))
        }else{
            const resError :WSResponse = {code:500, requestId: ctx.requestId, message: "serverError"}
            ctx.ws.send(JSON.stringify(resError))
        }
    }
}   


export const joinToLobbyByInviteCode = async (ctx: WSContext)=>{

}
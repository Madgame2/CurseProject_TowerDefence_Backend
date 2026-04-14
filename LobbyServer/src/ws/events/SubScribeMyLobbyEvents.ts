import { WSContext } from "../types/WSContext";
import { lobbyNotifier } from "../Services/NotifySustem/NotifySystem";
import { Lobbyreposiory } from "../Services/LobbyService/LobbyRepository/Imp/LobbyReposiotory.Redis";
import { LobbyNotifuerAlreadyInLobbyException } from "../Exceptions/LobbyNotifuerAlreadyInLobbyException";

export const SubScribeMyLobbyEvents = async(ctx:WSContext)=>{
    const lobbRep = new Lobbyreposiory;
    try{
        
        const Lobbyid =  await lobbRep.getUserLobby(ctx.userId!);
        
        lobbyNotifier.subscribeOnLobbyUpdates(ctx.userId!,Lobbyid!);
    }catch(e){
        if(e instanceof  LobbyNotifuerAlreadyInLobbyException){
            lobbyNotifier.unsubscribeUserFromLobbyLocalUpdates(ctx.userId!);

            const lobbyId = await lobbRep.getUserLobby(ctx.userId!);
            lobbyNotifier.subscribeOnLobbyUpdates(ctx.userId!, lobbyId!);
        }else{
            console.log(e);
        }
    }
}
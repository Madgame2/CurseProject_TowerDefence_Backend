import { WSContext } from "../types/WSContext";
import { lobbyNotifier } from "../Services/NotifySustem/NotifySystem";

export const UnsubScribeMyLobbyEvents = async (ctx:WSContext)=>{
    lobbyNotifier.unsubscribeUserFromLobbyLocalUpdates(ctx.userId!);
}
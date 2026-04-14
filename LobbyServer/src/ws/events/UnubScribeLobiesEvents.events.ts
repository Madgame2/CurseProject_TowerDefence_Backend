import { WSContext } from "../types/WSContext";
import { lobbyNotifier } from "../Services/NotifySustem/NotifySystem";

export const UnubScribeLobiesEvents = async (ctx:WSContext)=>{
    lobbyNotifier.unsubscribeUserFromGlobalEvents(ctx.userId!);
}
import { WSContext } from "../types/WSContext";
import { lobbyNotifier } from "../Services/NotifySustem/NotifySystem";

export const subscribeLobiesEvents = async (ctx: WSContext)=>{
    lobbyNotifier.subscribeToGlobalEvents(ctx.userId!);
}
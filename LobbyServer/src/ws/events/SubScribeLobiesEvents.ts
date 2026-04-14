import { WSContext } from "../types/WSContext";
import { lobbyNotifier } from "../Services/NotifySustem/NotifySystem";

export const subscribeLobiesEvents = async (ctx: WSContext)=>{
    console.log("SUBSCRUBE TO GLOBAL");
    lobbyNotifier.subscribeToGlobalEvents(ctx.userId!);
}
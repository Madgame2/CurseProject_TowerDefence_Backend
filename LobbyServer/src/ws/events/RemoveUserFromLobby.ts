import lobbyService from "../Services/LobbyService/Lobby.Service";
import { WSContext } from "../types/WSContext";


export const RemoveUserFromLobby = async (ctx: WSContext) => {
    const message = ctx.message;
    if (!message?.payload?.id) return;

    const lobby = await lobbyService.GetLobbyByHostId(ctx.userId!);
    if (!lobby) return;

    const hasThisPlayer = lobby.users.find(
        user => user === message.payload.id
    );

    if (!hasThisPlayer) return;

    try {
        await lobbyService.LeaveAndCreateLobby(message.payload.id);
    } catch (ex) {
        console.error("RemoveUserFromLobby error:", ex);
    }
};
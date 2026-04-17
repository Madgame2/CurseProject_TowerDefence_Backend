import { WSResponse } from "../../types/WSResponse";
import { MatchMakingSchema } from "../dto/MatchMakingRequestDTO";
import { SessionSearchService } from "../Services/SessionSerachService/SessionSerachService";
import { WSContext } from "../types/WSContext";

export const startSession = async (ctx: WSContext) => {
    const sessionSearchService = new SessionSearchService();

    try {
        console.log(ctx.message?.payload);
        const dto = MatchMakingSchema.parse(ctx.message?.payload);

        console.log(dto);
        const result = await sessionSearchService.StartSerach(ctx.userId!, dto);

        console.log(result);

        ctx.ws.send(JSON.stringify({
            code: 200,
            requestId: ctx.requestId,
            data: result
        }));

    } catch (err: any) {
        // 1. DTO validation (Zod)
        if (err?.name === "ZodError") {
            ctx.ws.send(JSON.stringify({
                code: 400,
                requestId: ctx.requestId,
                error: "Invalid DTO"
            }));
            return;
        }

        // 2. Lobby not found
        if (err?.name === "LobbyNotFoundException") {
            ctx.ws.send(JSON.stringify({
                code: 404,
                requestId: ctx.requestId,
                error: "Lobby not found"
            }));
            return;
        }

        // 3. Wrong host
        if (err?.name === "WrongLobbyHostException") {
            ctx.ws.send(JSON.stringify({
                code: 403,
                requestId: ctx.requestId,
                error: "You are not lobby host"
            }));
            return;
        }

        // 4. No dispatchers
        if (err?.name === "NoDespathcersException") {
            ctx.ws.send(JSON.stringify({
                code: 503,
                requestId: ctx.requestId,
                error: "No dispatchers available"
            }));
            return;
        }

        // 5. Dispatcher errors
        if (err?.name === "QueueFullException") {
            ctx.ws.send(JSON.stringify({
                code: 409,
                requestId: ctx.requestId,
                error: "Queue is full"
            }));
            return;
        }

        if (err?.name === "DispatcherUnavailableException") {
            ctx.ws.send(JSON.stringify({
                code: 503,
                requestId: ctx.requestId,
                error: "Dispatcher unavailable"
            }));
            return;
        }

        if (err?.name === "InvalidMatchmakingRequestException") {
            ctx.ws.send(JSON.stringify({
                code: 400,
                requestId: ctx.requestId,
                error: "Invalid matchmaking request"
            }));
            return;
        }

        // 6. fallback
        ctx.ws.send(JSON.stringify({
            code: 500,
            requestId: ctx.requestId,
            error: "Internal server error"
        }));
    }
};
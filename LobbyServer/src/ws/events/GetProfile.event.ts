import { WSContext } from "../types/WSContext";
import { ProfileService } from "../Services/ProfileSirevice/ProfileService";

export const GetProfile = async (ctx: WSContext) => {
    try {
        const profile = await ProfileService.getProfile(ctx.userId!);

        if (!profile) {
            ctx.ws.send(JSON.stringify({
                code: 404,
                message: "Profile not found",
                requestId: ctx.requestId
            }));
            return;
        }

        ctx.ws.send(JSON.stringify({
            code: 200,
            data: profile,
            requestId: ctx.requestId
        }));

    } catch (error) {
        console.error("GetProfile error:", error);

        ctx.ws.send(JSON.stringify({
            code: 500,
            message: "Internal server error",
            requestId: ctx.requestId
        }));
    }
};
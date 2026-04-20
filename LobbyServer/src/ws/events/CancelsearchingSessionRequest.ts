import { date } from "zod";
import { WSResponse } from "../../types/WSResponse";
import { WSContext } from "../types/WSContext";
import { redis } from "../../config/redis.config";
import { RedisScripts } from "../../redis/scriptsLoader";

export const CancelRequest = async (ctx: WSContext) => {
    try {

        const result = await redis.evalsha(
            RedisScripts.CancelSearchtaskSha,
            1,
            `user:${ctx.userId}:lobby`
        );

        console.log(result)
        let res: WSResponse;

        switch (result) {
            case 0:
                res = {
                    code: 404,
                    requestId: ctx.requestId,
                    data: "LOBBY_NOT_FOUND"
                };
                break;

            case 1:
                res = {
                    code: 404,
                    requestId: ctx.requestId,
                    data: "TASK_NOT_FOUND"
                };
                break;

            case 2:
                res = {
                    code: 404,
                    requestId: ctx.requestId,
                    data: "TASK_MISSING"
                };
                break;

            case 3:
                res = {
                    code: 409,
                    requestId: ctx.requestId,
                    data: "TASK_NOT_CANCELABLE"
                };
                break;

            case 4:
                res = {
                    code: 200,
                    requestId: ctx.requestId,
                    data: "CANCELLED"
                };
                break;

            default:
                res = {
                    code: 500,
                    requestId: ctx.requestId,
                    data: "UNKNOWN_RESULT"
                };
        }

        console.log(res);
        return ctx.ws.send(JSON.stringify(res));

    } catch (e) {
        console.log(e);

        const res: WSResponse = {
            code: 500,
            requestId: ctx.requestId,
            data: "INTERNAL_ERROR"
        };

        return ctx.ws.send(JSON.stringify(res));
    }
};
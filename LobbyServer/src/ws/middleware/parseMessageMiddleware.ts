import { WSContext } from "../types/WSContext"
import { WSResponse } from "../../types/WSResponse";

export const parseMessage = async(ctx: WSContext, next:(err?: any) => void)=>{
    try{
        ctx.message = JSON.parse(ctx.rawMessage!);
        await next();
    } catch(e){
        const errResponse: WSResponse = { code: 400, message: "Cannot definde message" };
        ctx.ws.send(JSON.stringify(errResponse));
    }
}
import { WSResponse } from "../../types/WSResponse";
import { WSContext } from "../types/WSContext";


export const startSession = async (ctx:WSContext)=>{
    const res:WSResponse = {code:200, requestId: ctx.requestId}

    ctx.ws.send(JSON.stringify(res));
}
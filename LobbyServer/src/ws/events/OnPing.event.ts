import { WSContext } from "../types/WSContext";
import { WSResponse } from "../../types/WSResponse";


export const onPing = async (ctx:WSContext)=>{
    const res : WSResponse = {action: "pong", code:200};
    ctx.lastPing = Date.now();
    ctx.ws.send(JSON.stringify(res));
}
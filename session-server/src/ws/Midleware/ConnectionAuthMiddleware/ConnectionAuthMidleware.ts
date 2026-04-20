import { WSContext } from "../../Types/WsContext"


export const ConnectionAuthMidleware =  async (ctx: WSContext, next:(err?: any) => void)=>{

    next();
}
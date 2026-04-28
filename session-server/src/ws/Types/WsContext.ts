import { WebSocket } from "ws";
import { IncomingMessage } from "http";
import { WSMessage } from "./WSMessage";


export interface WSContext {
    ws: WebSocket;
    req: IncomingMessage;

    userState?: string;
    userId?: string;
    sessionId?: string;

    message?: WSMessage;
    rawMessage?: string;
    
    [key: string]: any; // можно расширять под игру

}

// Middleware тип
export interface ConnectionMiddleware {
  handle(client: WSContext, next: (err?: any) => void | Promise<void>): Promise<void> | void;
}
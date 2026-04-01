import { WebSocket } from "ws";
import { IncomingMessage } from "http";


export interface WSContext {
    ws: WebSocket;
    req: IncomingMessage;
    userId?: string;
    sessionId?: string;
    [key: string]: any; // можно расширять под игру
}

// Middleware тип
export type ConnectionMiddleware = (ctx: WSContext, next: () => Promise<void>) => Promise<void>;
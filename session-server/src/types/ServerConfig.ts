import { serverStatus } from "./serverStatuses.enum";


export interface ServerConfig {
    serverId: string;
    host: string;
    port: number;
    maxLoad: number;
    canAccept: boolean;
    status: serverStatus
}
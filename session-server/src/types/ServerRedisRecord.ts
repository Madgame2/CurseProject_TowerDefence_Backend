import { serverStatus } from "./serverStatuses.enum"


export type ServerRedisRecord ={
    host: string,
    port: number,
    maxLoad: number,
    currentLoad: number,
    status: serverStatus
    canAccept: boolean
}


export type SessionServerRedisRecord ={
    serverId: string,
    host: string,
    port: number,
    maxLoad: number,
    currentLoad: number,
    status: "ONLINE" | "sleep" | "OFFLINE" | "ERROR",
    canAccept: boolean
}
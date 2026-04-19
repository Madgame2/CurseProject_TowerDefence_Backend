

export type SessionServerRedisRecord ={
    serverId: string,
    host: string,
    port: number,
    maxLoad: number,
    currentLoad: number,
    status: "online" | "sleep" | "offline" | "ERROR",
    canAccept: boolean
}
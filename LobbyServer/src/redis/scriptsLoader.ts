import fs from "fs";
import path from "path";
import { redis } from "../config/redis.config";

export class RedisScripts {
    public static lobbyDisconnectSha: string;
    public static matchmakingEnqueueSha: string;
    public static CancelSearchtaskSha: string;

    static async loadScripts() {
        const disconnectScript = fs.readFileSync(
            path.join(__dirname, "scripts/lobbyDisconnect.lua"),
            "utf-8"
        );

        const matchmakingScript = fs.readFileSync(
            path.join(__dirname, "scripts/matchmakingEnqueue.lua"),
            "utf-8"
        );

        const cancelSearchScript = fs.readFileSync(
            path.join(__dirname, "scripts/CancelsSearchSession.lua"),
            "utf-8"
        );

        const disconnectSha = await redis.script("LOAD", disconnectScript);
        const matchmakingSha = await redis.script("LOAD", matchmakingScript);
        const cancelSearchSha = await redis.script("LOAD", cancelSearchScript);

        RedisScripts.lobbyDisconnectSha = disconnectSha as string;
        RedisScripts.matchmakingEnqueueSha = matchmakingSha as string;
        RedisScripts.CancelSearchtaskSha = cancelSearchSha as string;
    }

}
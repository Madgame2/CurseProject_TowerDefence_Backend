import fs from "fs";
import path from "path";
import { redis } from "../config/redis.config";

export class RedisScripts {
    public static lobbyDisconnectSha: string;

    static async loadScripts() {


    const script = fs.readFileSync(
        path.join(__dirname, "scripts/lobbyDisconnect.lua"),
        "utf-8"
    );

    const sha = await redis.script("LOAD", script);
    RedisScripts.lobbyDisconnectSha = sha as string;
    }
}
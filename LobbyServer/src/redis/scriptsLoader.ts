import fs from "fs";
import path from "path";
import { redis } from "../config/redis.config";

export class RedisScripts {
    public static lobbyDisconnectSha: string;
    public static matchmakingEnqueueSha: string;
    public static CancelSearchtaskSha: string;
    public static GetuserStateSha:string;
    public static deleteuserSha:string;
    public static joinToOtherLobbySha: string;


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

        const GetUserStateScript = fs.readFileSync(
            path.join(__dirname, "scripts/GetOrInitUserState.lua"),
            "utf-8"
        );

        const deleteUserScript = fs.readFileSync(
            path.join(__dirname, "scripts/deleteUseronDisconetc.lua"),
            "utf-8"
        );

        const joinToOtherLobbyScript = fs.readFileSync(
            path.join(__dirname, "scripts/JoinToOtherLobby.lua"),
            "utf-8"
        );

        const disconnectSha = await redis.script("LOAD", disconnectScript);
        const matchmakingSha = await redis.script("LOAD", matchmakingScript);
        const cancelSearchSha = await redis.script("LOAD", cancelSearchScript);
        const GetUserStateSha = await redis.script("LOAD", GetUserStateScript);
        const deleteUserRecidsSha = await redis.script("LOAD", deleteUserScript);
        const joinToOtherLobbySha = await redis.script("LOAD", joinToOtherLobbyScript);

        RedisScripts.lobbyDisconnectSha = disconnectSha as string;
        RedisScripts.matchmakingEnqueueSha = matchmakingSha as string;
        RedisScripts.CancelSearchtaskSha = cancelSearchSha as string;
        RedisScripts.GetuserStateSha = GetUserStateSha as string;
        RedisScripts.deleteuserSha = deleteUserRecidsSha as string;
        RedisScripts.joinToOtherLobbySha = joinToOtherLobbySha as string;
    }

}
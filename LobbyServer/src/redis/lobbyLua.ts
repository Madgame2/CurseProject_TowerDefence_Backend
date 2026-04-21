import { redis } from "../config/redis.config";
import { RedisScripts } from "./scriptsLoader";

export class LobbyLua {



        static async disconnectUser(params: {
            lobbyId: string;
            userId: string;
        }) {
            const { lobbyId, userId } = params;

            const inviteCode = await redis.get(`lobby:${lobbyId}:inviteCode`);

            if (!inviteCode) return;

        const result = await redis.evalsha(
                RedisScripts.lobbyDisconnectSha,
                9,
                `lobby:${lobbyId}:users`,
                `lobby:${lobbyId}:host`,
                "lobbies",
                `invite:${inviteCode}`,
                `user:${userId}:lobby`,
                `lobby:${lobbyId}:hostName`,
                `lobby:${lobbyId}:headerImage`,
                `lobby:${lobbyId}:inviteCode`,
                `index:lobby:${lobbyId}:lastTask`,
                userId,
                lobbyId
            );

        return Number(result);
        }
}
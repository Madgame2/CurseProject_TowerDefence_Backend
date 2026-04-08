import { redis } from "../config/redis.config";

export class LobbyCleanupJob {
    private intervalMs = 10000; // каждые 10 секунд

    start() {
        setInterval(async () => {
            try {
                const keys = await redis.keys("lobby:*:users");

                for (const key of keys) {
                    const lobbyId = key.split(":")[1];
                    const users = await redis.smembers(key);

                    if (users.length === 0) {
                        console.log(`Cleaning empty lobby ${lobbyId}`);

                        await redis.del(`lobby:${lobbyId}:users`);
                        await redis.del(`lobby:${lobbyId}:host`);
                    }
                }
            } catch (e) {
                console.error("Lobby cleanup error:", e);
            }
        }, this.intervalMs);
    }
}
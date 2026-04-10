import { redis } from "../config/redis.config";

const TTL = 600;

export const ProfileCache = {
    async get(userId: string) {
        const key = this.key(userId);
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    },

    async set(userId: string, profile: any) {
        const key = this.key(userId);
        await redis.set(key, JSON.stringify(profile), "EX", TTL);
    },

    key(userId: string) {
        return `profile:${userId}`;
    }
};
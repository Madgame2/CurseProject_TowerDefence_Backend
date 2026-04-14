import { ProfileCache } from "../../../Cache/profile.cache";
import { PlayerRepository_DB } from "../../../repositories/impl/PlayerRepository_DB";
import { IPlayerRepository } from "../../../repositories/IPlayerRepository";
import { Player } from "../../../models/player.entity";

const PlayerRepository = new PlayerRepository_DB

export const ProfileService = {
    async getProfile(userId: string) :Promise<Player|null> {
        // 1. cache
        const cached = await ProfileCache.get(userId);
        if (cached) return cached;

        // 2. db
        const profile = await PlayerRepository.findById(userId);
        if (!profile) return null;

        const plain = profile.toJSON();

        // 3. cache set
        await ProfileCache.set(userId, plain);

        return plain;
    }
};
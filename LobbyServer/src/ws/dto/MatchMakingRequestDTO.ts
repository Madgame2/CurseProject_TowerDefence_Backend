import { z } from "zod";





export const MatchMakingSchema = z.object({
    Seed: z.number(),
    LobbyId: z.string(),
    matchDifficulty: z.enum(["Easy", "Normal", "Hard"])
});

export type MatchMakingRequestDTO = z.infer<typeof MatchMakingSchema>;
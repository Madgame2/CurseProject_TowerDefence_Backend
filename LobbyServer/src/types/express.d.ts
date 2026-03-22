import { Player } from "../models/player.entity";

declare global {
    namespace Express {
        interface Request{
            player?: Player
        }
    }
}
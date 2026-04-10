import dotenv from "dotenv";
import { LobbyUser } from "./LobbyUser";
dotenv.config();

export class Lobby {
    id: string;
    users: string[];
    usersProfiles: LobbyUser[];
    host: string | null;
    maxSize: number;

    constructor(id: string, host: string, maxSize?: number) {
        this.id = id;
        this.users = [host];
        this.host = host;

        this.usersProfiles = [];
        // если в env есть значение — используем его, иначе дефолт 4
        this.maxSize = maxSize ?? (Number(process.env.LOBBY_MAXSIZE) || 4);
    }

    get isFull(): boolean {
        return this.users.length >= this.maxSize;
    }
}
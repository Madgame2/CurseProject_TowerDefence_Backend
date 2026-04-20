import { SessionDificulty } from "./Dificulty.enum";
import { SessionState } from "./SessionState.enum";

export class Session{
    SessionID!: string;
    Dificulty!: SessionDificulty;
    Seed!: number;
    Players!: string[];
    onlinePlayersId?: string[]
    PassToken!: string;
    SessionState!: SessionState
}
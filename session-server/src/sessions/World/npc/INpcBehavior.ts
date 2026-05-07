import { INpc } from "./INpc";

export interface INpcBehavior {
    update(npc: INpc, delta: number): void;
    getState(): string;
}
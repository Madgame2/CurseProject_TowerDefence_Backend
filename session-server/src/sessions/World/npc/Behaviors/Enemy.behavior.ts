import { INpc } from "../INpc";
import { INpcBehavior } from "../INpcBehavior";


export class EnemyBehavior implements INpcBehavior{
    
    
    update(npc: INpc, delta: number): void {
        
    }

    getState(): string {
        return ""
    }
}
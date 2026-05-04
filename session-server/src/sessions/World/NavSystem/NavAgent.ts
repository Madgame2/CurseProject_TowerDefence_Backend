import { Vector2 } from "src/types/Vector2";
import { PathfindingService } from "./PathfindingService";


export class NavAgent {
    path?: Vector2[];
    curentIndex?: number
    target: Vector2|null = null;

    needsRepath: Boolean = false;

    constructor(private pathfinder: PathfindingService) {}

    setTarget(position: Vector2){
        this.target = position;
        this.needsRepath = true;
    }


    recalculatePath(currentPosition: Vector2) {
        if (!this.target) return;
        this.path = this.pathfinder.findPath(currentPosition, this.target);

        //console.log(this.path);
        this.curentIndex = 0;
        this.needsRepath = false;
    }


update(currentPosition: Vector2): Vector2 | null {
    if (!this.path || this.needsRepath) {
        this.recalculatePath(currentPosition);
    }

    if (!this.path || this.path.length === 0) return null;

    const targetPoint = this.path[this.curentIndex ?? 0];

    const dx = targetPoint.x - currentPosition.x;
    const dy = targetPoint.y - currentPosition.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    // 🔥 если почти дошли — переключаем точку
    if (dist < 0.01) {
        this.curentIndex!++;

        if (this.curentIndex! >= this.path.length) {
            this.path = undefined;
            return null;
        }

        return this.update(currentPosition); // берём следующую точку
    }

        // 🔥 нормализуем направление
        return new Vector2(dx / dist, dy / dist);
    }
}
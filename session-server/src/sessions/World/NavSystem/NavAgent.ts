import { Vector2 } from "src/types/Vector2";
import { PathfindingService } from "./PathfindingService";


export class NavAgent {
    public path?: Vector2[];
    public currentIndex = 0;

    private target?: Vector2;
    needsRepath = false;

    constructor(private pathfinder: PathfindingService) {}

    setTarget(target: Vector2) {
        this.target = target;
        this.needsRepath = true;
    }

    stop(): void {

        this.path = undefined;

        this.target = undefined;

        this.currentIndex = 0;

        this.needsRepath = false;
    }

update(currentPosition: Vector2): Vector2 | null {

    if (!this.path || this.path.length < 2) {
        return null;
    }

    if (this.currentIndex >= this.path.length - 1) {
        this.path = undefined;
        return null;
    }

    const reachRadius = 0.6;

    const current = this.path[this.currentIndex];
    const next = this.path[this.currentIndex + 1];

    // =========================
    // СЕГМЕНТ ПУТИ (ВАЖНОЕ ИЗМЕНЕНИЕ)
    // =========================
    const segment = Vector2.subtract(next, current);

    const toCurrent = Vector2.subtract(current, currentPosition);
    const toNext = Vector2.subtract(next, currentPosition);

    // если уже прошли текущую точку → двигаемся дальше
    if (toNext.lengthSquared() < reachRadius * reachRadius) {
        this.currentIndex++;
        return this.update(currentPosition);
    }

    // =========================
    // ПРОЕКЦИЯ НА СЕГМЕНТ
    // =========================

    const segDir = segment.normalize();

    // просто двигаемся ВДОЛЬ линии, а не к точке
    const velocity = segDir;

    return velocity;
}

    public recalculatePath(currentPosition: Vector2) {

        if (!this.target) {
            return;
        }

        this.path = this.pathfinder.findPath(currentPosition, this.target);

        this.currentIndex = 0;
        this.needsRepath = false;
    }

    hasPath(): boolean {
        return !!this.path;
    }
}
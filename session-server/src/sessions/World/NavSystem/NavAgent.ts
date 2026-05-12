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
    update(currentPosition: Vector2, moveDistance: number): Vector2 | null {

        if (!this.path || this.path.length < 2) {
            this.clearPath();
            return null;
        }

        const reachRadiusSq = 0.36;

        const lastIndex = this.path.length - 1;

        if (this.currentIndex >= lastIndex) {
            this.clearPath();
            return null;
        }

        const current = this.path[this.currentIndex];
        const next = this.path[this.currentIndex + 1];

        if (!current || !next) {
            this.clearPath();
            return null;
        }

        const toNext = Vector2.subtract(next, currentPosition);

        const distToNextSq = toNext.lengthSquared();
        const distToNext = Math.sqrt(distToNextSq);

        // =========================================================
        // ФИНАЛЬНАЯ ТОЧКА
        // =========================================================
        if (this.currentIndex === lastIndex - 1) {

            // если за этот кадр дошли или перелетели
            if (distToNext <= moveDistance) {

                // ЖЁСТКИЙ SNAP
                currentPosition.x = next.x;
                currentPosition.y = next.y;

                this.currentIndex++;
                this.clearPath();

                return null;
            }
        }

        // =========================================================
        // ОБЫЧНОЕ ДОСТИЖЕНИЕ ТОЧКИ
        // =========================================================
        if (distToNextSq <= reachRadiusSq) {
            this.currentIndex++;
            return null;
        }

        // =========================================================
        // ДВИЖЕНИЕ
        // =========================================================
        return toNext.normalize();
    }

private clearPath() {
    this.path = undefined;
    this.currentIndex = 0;
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
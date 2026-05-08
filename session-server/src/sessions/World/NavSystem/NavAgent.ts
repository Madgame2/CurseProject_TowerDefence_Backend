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

    update(currentPosition: Vector2): Vector2 | null {


        if (this.needsRepath) {
            //this.recalculatePath(currentPosition);
        }

        if (!this.path || this.path.length === 0) {
            return null;
        }

        if (this.currentIndex >= this.path.length) {
            this.path = undefined;

            return null;
        }

        const point = this.path[this.currentIndex];

        const direction = Vector2.subtract(point, currentPosition);

        const distanceSq = direction.lengthSquared();

        // waypoint достигнут
        if (distanceSq <= 0.1) {

            this.currentIndex++;

            // путь закончился
            if (this.currentIndex >= this.path.length) {

                this.path = undefined;

                return null;
            }

            const nextPoint = this.path[this.currentIndex];

            return Vector2.subtract(
                nextPoint,
                currentPosition
            ).normalize();
        }

        return direction.normalize();
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
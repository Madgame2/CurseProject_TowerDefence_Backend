import { Vector2 } from "src/types/Vector2";


export interface IPatrolBehavior {
    setPatrolZones(center:Vector2, radius: number): void;
}
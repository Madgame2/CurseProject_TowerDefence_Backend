import { Vector2 } from "src/types/Vector2";


export interface IInteractable {
    getInteractionPoints():  Vector2[] | null;
}
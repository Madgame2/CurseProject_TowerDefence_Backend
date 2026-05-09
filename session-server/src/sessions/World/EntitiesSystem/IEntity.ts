import { Vector2 } from "src/types/Vector2";
import { EntityesEnum } from "./EntityesEnum";
import { EntityState } from "./EntityState";


export interface IEntity{
    Id:string
    type: EntityesEnum

    position: Vector2

    update(delta:number);

    getState();
}
import { EntityesEnum } from "./EntityesEnum";
import { EntityState } from "./EntityState";


export interface IEntity{
    Id:string
    type: EntityesEnum

    update(delta:number);

    getState();
}
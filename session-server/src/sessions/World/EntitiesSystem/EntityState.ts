import { EntityesEnum } from "./EntityesEnum";


export interface EntityState{
    id:string,
    entityType: EntityesEnum,
    data: any
}
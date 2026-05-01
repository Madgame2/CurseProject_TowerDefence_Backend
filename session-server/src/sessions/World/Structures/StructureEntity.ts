import { Vector2 } from "src/types/Vector2";

export class StructureEntity {
    constructor(
        public id: string,
        public StuructID: string,
        public position: Vector2,
    ) {}
}

export class StructureEntityWithHP extends StructureEntity{
 constructor(
        public id: string,
        public StuructID: string,
        public position: Vector2,
        public hp : number
 ){
    super(id,StuructID,position);
 }
}
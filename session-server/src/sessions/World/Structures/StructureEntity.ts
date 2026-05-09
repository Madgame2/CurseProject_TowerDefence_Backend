import { Vector2 } from "src/types/Vector2";
import { IInteractable } from "../EntitiesSystem/IInteractable";
import { StructureRegistry } from "./StructureRegistry";
import { EntityesEnum } from "../EntitiesSystem/EntityesEnum";
import { IAttackable } from "../EntitiesSystem/IAttackable";
import { IEntity } from "../EntitiesSystem/IEntity";

export class StructureEntity {
    constructor(
        public Id: string,
        public type: EntityesEnum,
        public StuructID: string,
        public position: Vector2,
    ) {}
}

export class StructureEntityWithHP extends StructureEntity implements IEntity , IInteractable, IAttackable{
 
    max_hp: number;
    constructor(
        public Id: string,
        public type: EntityesEnum,
        public StuructID: string,
        public position: Vector2,
        public current_hp : number
 ){
    super(Id,type,StuructID,position);
    this.max_hp = current_hp
 }

    takeDamage(amount: number): void {
        this.current_hp -=amount;
    }

    getInteractionPoints(): Vector2[] | null {

        const structure = StructureRegistry.get(this.StuructID);

        if (!structure) return null;

        const points = new Map<string, Vector2>();
        const occupied = new Set<string>();


        // Occupied world cells

        for (const block of structure.blocks) {

            const wx = this.position.x + block.x;
            const wz = this.position.y + block.z;

            occupied.add(`${wx}:${wz}`);
        }


        const directions = [
            { x: 1, z: 0 },
            { x: -1, z: 0 },
            { x: 0, z: 1 },
            { x: 0, z: -1 },
        ];


        for (const block of structure.blocks) {

            const wx = this.position.x + block.x;
            const wz = this.position.y + block.z;

            for (const dir of directions) {

                const nx = wx + dir.x;
                const nz = wz + dir.z;

                const key = `${nx}:${nz}`;

                if (!occupied.has(key)) {
                    points.set(key, new Vector2(nx, nz));
                }
            }
        }

        return Array.from(points.values());
    }


    update(delta: number) {
        
    }

    getState() {
        return   {
            current_hp: this.current_hp,
            health_present: this.current_hp/this.max_hp
        }
    }
}
import { EntityesEnum } from "../../EntityesEnum"
import { IEntity } from "../../IEntity"
import { Vector2 } from "src/types/Vector2"


export class CampInBuild implements IEntity{
    Id:string
    linkedPalyer: string
    inBuildProgeress:number
    buildCosst: number
    type: EntityesEnum = EntityesEnum.CampInBuild;

    position: Vector2

    private _isCompleted: boolean = false

    private _timer: number = 0
    private readonly _tickTime: number = 1        // раз в 1 секунду
    private readonly _progressPerTick: number = 50 // сколько добавляем

    constructor(id:string, linkedplayer:string, WorldPos: Vector2){
        this.Id = id;
        this.linkedPalyer = linkedplayer;
        this.inBuildProgeress =0;
        this.buildCosst = 1000;

        this.position = WorldPos;
    }

    onCompleted?: (entity: CampInBuild) => void

    getState() {
        return  {
            progress: this.inBuildProgeress / this.buildCosst
        }
    }

    update(delta: number) {
        if (this._isCompleted) return;

        const buildSpeed = this.buildCosst / 10; // 10 секунд

        this.inBuildProgeress += buildSpeed * delta;

        if (this.inBuildProgeress >= this.buildCosst) {
            this.inBuildProgeress = this.buildCosst;
            this._isCompleted = true;

            // вызываем событие ОДИН раз
            this.onCompleted?.(this);
        }
    }
}
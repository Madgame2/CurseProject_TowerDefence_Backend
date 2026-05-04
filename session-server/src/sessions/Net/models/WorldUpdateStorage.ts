import { IWorldUpdateState } from "./IWordlUpdateState";



export class WorldUpdatesStorage{

    private updates: IWorldUpdateState[] = []


    public add( update :IWorldUpdateState){
        this.updates.push(update);
    }

    public getAll(): IWorldUpdateState[] {
        const result = [...this.updates]; // копия
        this.updates.length = 0;          // очистка оригинала
        return result;
    }
}
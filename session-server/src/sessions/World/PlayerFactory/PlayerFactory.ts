import { Vector3 } from "src/types/Vector3";
import { Player } from "../Entities/Player";
import { World } from "../Entities/World";
import { Vector2 } from "src/types/Vector2";
import { NoFreeSpaceException } from "src/Exceptions/NoFreeSpaceException";


export class PlayerFactory{

    constructor(private world: World){}


    createNewPlayer(PlayerId: string, spawnCenter: Vector2, radius:number): Player{

        const player = new Player(PlayerId);

        let position = this.setPlayerPosition(spawnCenter, radius)
        
        player.position = position;
        return player;
    }

    private setPlayerPosition(spawnCenter: Vector2, radius: number): Vector3 {
        const maxAttempts = 5;        // сколько раз расширяем радиус
        const radiusStep = radius;    // на сколько увеличиваем каждый раз

        let currentRadius = radius;

        for (let i = 0; i < maxAttempts; i++) {
            const pos = this.world.worldQuery.findFreeSpawn(spawnCenter, currentRadius);

            if (pos) {
                return pos;
            }

            currentRadius += radiusStep; // расширяем зону поиска
        }

        throw new NoFreeSpaceException(
            `No free spawn. center=${spawnCenter.x},${spawnCenter.y}, finalRadius=${currentRadius}`
        );
    }

}
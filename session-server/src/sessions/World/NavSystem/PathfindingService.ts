import { Vector2 } from "src/types/Vector2";
import { World } from "../Entities/World";

type Node = {
    pos: Vector2;
    g: number;      // стоимость от старта
    h: number;      // сколько примерно осталось (sqrt())
    f: number;      // g + h
    parent: Node | null;
};

export class PathfindingService  {

    constructor(private world: World){}
    private losCache = new Map<string, boolean>();

    findPath(from:Vector2, to:Vector2):Vector2[]{
        const nodes = new Map<string, Node>();
        const start: Vector2 = new Vector2(
            Math.floor(from.x),
            Math.floor(from.y),
        )
        const end: Vector2 = new Vector2(
            Math.floor(to.x),
            Math.floor(to.y),
        )

        const worldQuery = this.world.worldQuery;
        const open = new OpenSet();
        const closed = new Set<string>();

        const startNode = this.getNode(start, nodes);
        startNode.g = 0;
        startNode.h = this.heuristic(start, end);
        startNode.f = startNode.h;
        startNode.parent = startNode; // 🔥 важно для Theta*

        open.push(startNode);


        while(!open.isEmpty()){

            console.log("ПЫТАЮсь НАЙТИ ПУТЬ")
            const current = open.pop();
            if(!current) continue

            const currentKey = `${current.pos.x},${current.pos.y}`;

            if (closed.has(currentKey)) continue;
            closed.add(currentKey);

            if(current.pos.x === end.x && current.pos.y === end.y){
                return this.reconstruct(current);
            }

            for(var dir of this.dirs()){
                const neighbourPos = Vector2.add(dir, current.pos);

                const neighbourKey = `${neighbourPos.x},${neighbourPos.y}`;

                if (closed.has(neighbourKey)) continue;
                if (
                    this.isBlocked(neighbourPos) &&
                    !(neighbourPos.x === end.x && neighbourPos.y === end.y)
                ) {
                    continue;
                }

                const neighbour = this.getNode(neighbourPos, nodes);

                let tentativeG: number;
                let parent: Node;

                if (current.parent && this.hasLineOfSight(current.parent.pos, neighbourPos)) {
                    tentativeG = current.parent.g + this.distance(current.parent.pos, neighbourPos);
                    parent = current.parent;
                } else {
                    tentativeG = current.g + this.distance(current.pos, neighbourPos);
                    parent = current;
                }


                if (tentativeG < neighbour.g) {
                    neighbour.g = tentativeG;
                    neighbour.h = this.heuristic(neighbourPos, end);
                    neighbour.f = neighbour.g + neighbour.h;
                    neighbour.parent = parent;

                    open.push(neighbour);
                }
            }
        }

        return []
    }

    private distance(a: Vector2, b: Vector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }


    isBlocked(pos: Vector2): boolean {
        const block = this.world.worldQuery.getBlock(
            Math.floor(pos.x),
            Math.floor(pos.y)
        );

        return block.isSolid; 
    }
    private getNode(pos: Vector2, nodes:Map<string, Node>): Node {
        const key = `${pos.x},${pos.y}`;

        let node = nodes.get(key);

        if (!node) {
            node = {
                pos,
                g: Infinity,
                h: 0,
                f: 0,
                parent: null
            };

            nodes.set(key, node);
        }

        return node;
    }

    private Key(pos: Vector2): string {
        return `${pos.x},${pos.y}`;
    }


    private hasLineOfSight(a: Vector2, b: Vector2): boolean {

        //const key = this.losKey(a, b);
        //const cached = this.losCache.get(key);

        //if (cached !== undefined) return cached;

        const result = this._hasLineOfSightImpl(a, b);
        //this.losCache.set(key, result);

        return result;
    }

private _hasLineOfSightImpl(a: Vector2, b: Vector2): boolean {

    let x0 = Math.floor(a.x);
    let y0 = Math.floor(a.y);
    let x1 = Math.floor(b.x);
    let y1 = Math.floor(b.y);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);

    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    console.log("LOS START", { x0, y0, x1, y1, dx, dy, sx, sy, err });

    let iter = 0;
    const MAX_ITER = 200; // safeguard

    while (true) {

        iter++;

        if (iter > MAX_ITER) {
            console.log("❌ LOS BREAK (MAX_ITER)", {
                x0, y0, x1, y1, err, dx, dy
            });
            return false;
        }

        console.log("STEP", {
            iter,
            pos: { x0, y0 },
            target: { x1, y1 },
            err
        });

        // проверка блока
        const isFree = this.world.worldQuery.isPositionFree({ x: x0, y: y0 } as Vector2);
        console.log("isFree:", isFree);

        if (!isFree) {
            console.log("❌ BLOCKED at", x0, y0);
            return false;
        }

        // 🔥 условие выхода
        if (x0 === x1 && y0 === y1) {
            console.log("✅ REACHED TARGET");
            break;
        }

        const e2 = 2 * err;

        console.log("e2:", e2, "compare:", {
            cond1: e2 > -dy,
            cond2: e2 < dx
        });

        let moved = false;

        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
            moved = true;
            console.log("➡️ MOVE X", { x0, err });
        }

        if (e2 < dx) {
            err += dx;
            y0 += sy;
            moved = true;
            console.log("⬆️ MOVE Y", { y0, err });
        }

        // 🔥 КЛЮЧЕВАЯ ПРОВЕРКА
        if (!moved) {
            console.log("💀 NO MOVEMENT DETECTED → infinite loop!", {
                x0, y0, err, dx, dy, e2
            });
            return false;
        }
    }

    return true;
}
    private dirs(): Vector2[] {
        return [
            new Vector2(1, 0),
            new Vector2(-1, 0),
            new Vector2(0, 1),
            new Vector2(0, -1),

            new Vector2(1, 1),
            new Vector2(1, -1),
            new Vector2(-1, 1),
            new Vector2(-1, -1),
        ];
    }

    private key(pos: Vector2): string {
        return `${pos.x},${pos.y}`;
    }

    private reconstruct(node: Node): Vector2[] {
        const path: Vector2[] = [];

        let current: Node | null = node;

        while (current) {
            console.log("ВОСТАНАВЛИВАЮ ")
            path.push(current.pos);

            // 🔥 КЛЮЧЕВОЙ МОМЕНТ
            if (current.parent === current) break;

            current = current.parent;
        }

        return path.reverse();
    }


    private dist(a: Vector2, b: Vector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private heuristic(a: Vector2, b: Vector2) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}


class OpenSet{
    private items: Node[] = [];

    push(node: Node) {
        this.items.push(node);
    }


    pop(): Node | undefined {
        let bestIndex = 0;

        for (let i = 1; i < this.items.length; i++) {
            if (this.items[i].f < this.items[bestIndex].f) {
                bestIndex = i;
            }
        }

        return this.items.splice(bestIndex, 1)[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}
import { Block } from "./Entities/Block";


export const BlockRegistry = new Map<number, Block>([
    [0, new Block(0, false)], // air
    [1, new Block(1, true)],  // RootHouse
]);
import { Block } from "./Entities/Block";


export const BlockRegistry = new Map<number, Block>([
    [0, new Block(0, false)], // air
    [1, new Block(1, true)],  // RootHouse
    [2, new Block(2, false)], //GrossCannon Preview
    [3, new Block(2, true)] //GrossCannon InBuidEntity
]);
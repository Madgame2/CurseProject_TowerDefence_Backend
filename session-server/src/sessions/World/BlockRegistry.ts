import { Block } from "./Entities/Block";


export const BlockRegistry = new Map<number, Block>([
    [0, new Block(0, false)],   //air
    [1, new Block(1, true) ],   //RootHouse
    [2, new Block(2, false)],   //GrossCannon Preview
    [3, new Block(3, true) ],   //GrossCannon InBuidEntity
    [4, new Block(4, true) ],   //GrossCannon
    [5, new Block(5, false)],   //TeslaTower Preview
    [6, new Block(6, true) ],   //TeslaTower InBuidEntity
    [7, new Block(7, true) ],   //TeslaTower
    [8, new Block(8, false)],   //Camp Preview
    [9, new Block(9, true) ],   //Camp InBuidEntity
    [10, new Block(10, false) ]    //Camp
]);
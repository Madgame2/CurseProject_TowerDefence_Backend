import { Structure } from "../StructureModels";

export const RootHouse = new Structure(
    "root_house",
    2,
    2,
    [
        { x: 0, z: 0, blockId: 1 },
        { x: 1, z: 0, blockId: 1 },
        { x: 0, z: 1, blockId: 1 },
        { x: 1, z: 1, blockId: 1 },
    ],
    100
);
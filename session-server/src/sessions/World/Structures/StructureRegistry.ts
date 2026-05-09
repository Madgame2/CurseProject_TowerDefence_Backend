import { Structure } from "./StructureModels";
import { RootHouse } from "./stuctures_imp/RootHouse.struct";


export const StructureRegistry = new Map<string, Structure>();


StructureRegistry.set(RootHouse.id, RootHouse);
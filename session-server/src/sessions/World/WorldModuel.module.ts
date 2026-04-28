import { Module } from "@nestjs/common";
import { WorldFactory } from "./worldFactory";

@Module({

    providers:[WorldFactory],
    exports:[WorldFactory]
})
export class WorldModule{}
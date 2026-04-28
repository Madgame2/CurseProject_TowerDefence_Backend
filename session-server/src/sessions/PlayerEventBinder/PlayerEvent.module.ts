import { Module } from "@nestjs/common";
import { PlayerEventBinder } from "./PlayerEventBinder";
import { ClientRegistryModule } from "src/ws/ClientRegistry/ClientRegistry.Module";


@Module({
    imports: [ClientRegistryModule],
    providers: [PlayerEventBinder],
    exports: [PlayerEventBinder]
})
export class PlayerEventModule{}
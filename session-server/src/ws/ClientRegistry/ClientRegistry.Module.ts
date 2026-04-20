import { Module } from "@nestjs/common";
import { ClientRegistryService } from "./ClientRegistry.service";


@Module({
    providers: [ClientRegistryService],
    exports: [ClientRegistryService]
})
export class ClientRegistryModule{}
import { Module } from "@nestjs/common";
import { SessionRegistry } from "./SessionRegistry";

@Module({
    providers:[SessionRegistry],
    exports: [SessionRegistry]
})
export class SessionRegistryModule{}
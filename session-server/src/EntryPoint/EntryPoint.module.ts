import { Module } from "@nestjs/common";
import { EntryPointService } from "./EntryPoint.service";
import { SessionModule } from "src/sessions/sessions.module";
import { ServerStateModule } from "src/ServerStateModule/ServerState.module";
import { EntryPointController } from "./EntryPoint.controller";

@Module({
  imports: [
    SessionModule,       
    ServerStateModule,   
  ],
  providers: [EntryPointService],
  controllers: [EntryPointController]
})
export class EntryPointModule {}
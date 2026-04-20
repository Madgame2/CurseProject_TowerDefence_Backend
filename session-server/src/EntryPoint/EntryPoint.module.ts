import { Module } from "@nestjs/common";
import { EntryPointService } from "./EntryPoint.service";
import { SessionModule } from "src/sessions/sessions.module";
import { ServerStateModule } from "src/ServerStateModule/ServerState.module";
import { EntryPointController } from "./EntryPoint.controller";

@Module({
  imports: [
    SessionModule,       // 🔥 вместо SessionsService
    ServerStateModule,   // 🔥 вместо ServerStateService
  ],
  providers: [EntryPointService],
  controllers: [EntryPointController]
})
export class EntryPointModule {}
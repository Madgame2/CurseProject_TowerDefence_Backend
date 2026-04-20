import { Module } from "@nestjs/common";
import { ServerStateService } from "./ServerState.Service";
import { InitModule } from "src/init/init.module";
import { ServerConfigService } from "src/init/ServerConfig.service";


@Module({
  providers: [ServerStateService, ServerConfigService],
  exports: [ServerStateService],
})
export class ServerStateModule {}
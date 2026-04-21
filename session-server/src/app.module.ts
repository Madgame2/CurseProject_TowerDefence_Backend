import { Module } from '@nestjs/common';
import { InitModule } from './init/init.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { WsGateway } from './ws/WsGateway';
import { LiveHeatBeatModule } from './LiveheartBeat/liveheadrbeat.module';
import { ClientRegistryModule } from './ws/ClientRegistry/ClientRegistry.Module';
import { EntryPointModule } from './EntryPoint/EntryPoint.module';
import { ServerStateService } from './ServerStateModule/ServerState.Service';
import { SessionModule } from './sessions/sessions.module';
import { ServerStateModule } from './ServerStateModule/ServerState.module';
import { MiddlewareModule } from './ws/Midleware/midleware.module';
import { SessionMannagerModule } from './sessions/sessionManager/sessionManager.model';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    InitModule,
    LiveHeatBeatModule,
    ClientRegistryModule,
    EntryPointModule,
    SessionModule,
    ServerStateModule,
    LiveHeatBeatModule,
    MiddlewareModule,
    SessionMannagerModule,
    SessionModule],
  controllers: [],
  providers: [WsGateway],
})
export class AppModule {}

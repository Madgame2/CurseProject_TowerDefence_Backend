import { Module } from '@nestjs/common';
import { InitModule } from './init/init.module';
import { RedisModule } from './redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),RedisModule,InitModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

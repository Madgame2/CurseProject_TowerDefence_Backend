import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { InitModule } from './init/init.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true, }),
  RedisModule,
  InitModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

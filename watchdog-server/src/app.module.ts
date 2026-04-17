import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WatchDogModule } from './wathers/WatchDog.module';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WatchDogModule,
  ],
})
export class AppModule {}

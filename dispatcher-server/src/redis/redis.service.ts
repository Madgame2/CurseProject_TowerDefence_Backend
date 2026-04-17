import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';


@Injectable()
export class RedisService{
  private client: Redis;

  constructor(private config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST') || 'localhost',
      port: Number(this.config.get('REDIS_PORT')) || 6379,
    });

    this.client.on('connect', () => {
      console.log('[Redis] connected');
    });

    this.client.on('error', (err) => {
      console.error('[Redis] error', err);
    });
  }

  getClient() {
    return this.client;
  }
}

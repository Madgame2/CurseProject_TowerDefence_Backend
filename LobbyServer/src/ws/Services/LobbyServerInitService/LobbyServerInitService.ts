import Redis from "ioredis";

type ServerConfig = {
  serverId: string;
  host: string;
  port: number;
  heartbeatIntervalMs?: number;
  ttlSeconds?: number;
};

export class LobbyServerRegistry {
  // ✅ FIX: правильный универсальный тип таймера
  private heartbeatTimer?: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly redis: Redis,
    private readonly config: ServerConfig
  ) {}

  async init() {
    await this.register();
    this.startHeartbeat();

    console.log(`[LobbyServer] registered: ${this.config.serverId}`);
  }

  private async register() {
    const { serverId, host, port, ttlSeconds = 30 } = this.config;

    await this.redis.hset(`server:${serverId}`, {
      host,
      port: String(port),
      status: "online",
      type: "lobby",
      startedAt: Date.now().toString(),
    });

    // живой флаг
    await this.redis.set(
      `server:${serverId}:online`,
      "1",
      "EX",
      ttlSeconds
    );
  }

  private startHeartbeat() {
    const {
      serverId,
      heartbeatIntervalMs = 10000,
      ttlSeconds = 30,
    } = this.config;

    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.redis.set(
          `server:${serverId}:online`,
          "1",
          "EX",
          ttlSeconds
        );
      } catch (err) {
        console.error("[heartbeat error]", err);
      }
    }, heartbeatIntervalMs);
  }

  async shutdown() {
    const { serverId } = this.config;

    // ✅ безопасная остановка таймера
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    await this.redis.hset(`server:${serverId}`, {
      status: "offline",
      stoppedAt: Date.now().toString(),
    });

    await this.redis.del(`server:${serverId}:online`);
  }
}
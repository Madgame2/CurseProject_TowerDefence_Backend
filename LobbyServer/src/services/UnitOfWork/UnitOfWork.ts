// src/unitOfWork/UnitOfWork.ts
import { IPlayerRepository } from "../../repositories/IPlayerRepository";
import { PlayerRepository_DB } from "../../repositories/impl/PlayerRepository_DB";
import { sequelize } from "../../config/DB.config"
import { Transaction } from "sequelize";
import Redis from "ioredis";
import RedisClient from "ioredis";
import { ILobbyRepository } from "../../ws/Services/LobbyService/LobbyRepository/ILobbyRepository";
import { Lobbyreposiory } from "../../ws/Services/LobbyService/LobbyRepository/Imp/LobbyReposiotory.Redis";

export class UnitOfWork {
  public players!: IPlayerRepository;
  public lobby?: ILobbyRepository = new Lobbyreposiory();
  private transaction?: Transaction | undefined;
  private redisClient: Redis;          // клиент ioredis
  private redisMulti?: ReturnType<RedisClient["multi"]> | null = null;  // MULTI / pipeline для атомарных команд


  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async start() {
    // Создаём транзакцию
    this.transaction = await sequelize.transaction();

    // Привязываем репозитории к этой транзакции
    this.players = new PlayerRepository_DB(this.transaction);

    this.redisMulti = this.redisClient.multi();
  }

  redisCommand(fn: (pipeline: ReturnType<Redis["multi"]>) => void) {
    if (!this.redisMulti) throw new Error("Redis MULTI not started");
    fn(this.redisMulti); 
  }

  async commit() {
    if (!this.transaction) throw new Error("Transaction not started");
    await this.transaction.commit();
    this.transaction = undefined;

    if (this.redisMulti) {
      await this.redisMulti.exec(); 
      this.redisMulti = null;
    }
  }

  async rollback() {
    if (!this.transaction) throw new Error("Transaction not started");
    await this.transaction.rollback();
    this.transaction = undefined;



    this.redisMulti = null;
  }

  async release() {
    this.transaction = undefined;
    this.redisMulti = null;
  }
}
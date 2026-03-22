// src/unitOfWork/UnitOfWork.ts
import { IPlayerRepository } from "../../repositories/IPlayerRepository";
import { PlayerRepository_DB } from "../../repositories/impl/PlayerRepository_DB";
import { sequelize } from "../../config/DB.config"
import { Transaction } from "sequelize";

export class UnitOfWork {
  public players!: IPlayerRepository;
  private transaction?: Transaction | undefined;

  constructor() {
    // Репозитории будут инициализированы после start()
  }

  async start() {
    // Создаём транзакцию
    this.transaction = await sequelize.transaction();

    // Привязываем репозитории к этой транзакции
    this.players = new PlayerRepository_DB(this.transaction);
  }

  async commit() {
    if (!this.transaction) throw new Error("Transaction not started");
    await this.transaction.commit();
    this.transaction = undefined;
  }

  async rollback() {
    if (!this.transaction) throw new Error("Transaction not started");
    await this.transaction.rollback();
    this.transaction = undefined;
  }

  async release() {
    this.transaction = undefined;
  }
}
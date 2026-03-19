import { QueryRunner, DataSource } from "typeorm";
import { IPlayerRepository } from "../../repositories/IPlayerRepository";
import { PlayerRepository_DB } from "../../repositories/impl/PlayerRepository_DB";

export class UnitOfWork {
    private queryRunner: QueryRunner;
    public players: IPlayerRepository;

    constructor(private dataSource: DataSource) {
        this.queryRunner = this.dataSource.createQueryRunner();
        
        this.players = new PlayerRepository_DB(this.queryRunner);
    }

    async start() {
        await this.queryRunner.connect();
        await this.queryRunner.startTransaction();
    }

    async commit() {
        await this.queryRunner.commitTransaction();
    }

    async rollback() {
        await this.queryRunner.rollbackTransaction();
    }

    async release() {
        await this.queryRunner.release();
    }
}
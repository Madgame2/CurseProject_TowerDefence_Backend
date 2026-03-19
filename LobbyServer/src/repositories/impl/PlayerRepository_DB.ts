import { Repository, QueryRunner } from "typeorm";
import { Player } from "../../models/player.entity";
import { IPlayerRepository } from "../IPlayerRepository";

export class PlayerRepository_DB implements IPlayerRepository{
    private repo: Repository<Player>;

    constructor(private queryRunner: QueryRunner) {
        this.repo = queryRunner.manager.getRepository(Player);
    }
}
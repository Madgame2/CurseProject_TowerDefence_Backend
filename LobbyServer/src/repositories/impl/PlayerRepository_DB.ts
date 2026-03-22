import { IPlayerRepository } from "../../repositories/IPlayerRepository";
import { Player } from "../../models/player.entity";
import { Transaction } from "sequelize";
import { RegisterUserDTO } from "../../dto/RegisterUserDTO";

export class PlayerRepository_DB implements IPlayerRepository {

    private transaction: Transaction | null;

    constructor(transaction?: Transaction) {
        this.transaction = transaction ?? null; // если undefined → null
    }


    public findByEmail = async (email: string): Promise<Player | null> => {
        return await Player.findOne({
            where: { email },
        transaction: this.transaction ?? null, // Sequelize ждет null вместо undefined
        });
    };

    public Create = async (dto: RegisterUserDTO): Promise<Player| null> =>{
        return await Player.create({
            nickname: dto.nickname,
            email: dto.email,
            password: dto.password
        }, { transaction: this.transaction });
                
    }
}
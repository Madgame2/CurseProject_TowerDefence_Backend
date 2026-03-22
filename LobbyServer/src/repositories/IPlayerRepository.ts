import { RegisterUserDTO } from "../dto/RegisterUserDTO"
import { Player } from "../models/player.entity"

export interface IPlayerRepository {
    
    findByEmail(email: string): Promise<Player | null>
    Create(dto: RegisterUserDTO): Promise<Player| null>
}
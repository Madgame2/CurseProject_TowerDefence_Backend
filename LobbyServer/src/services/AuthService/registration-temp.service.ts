import { redis } from "../../config/redis.config";
import { RegisterUserDTO } from "../../dto/RegisterUserDTO";

interface TempRedisData {
    email: string;
    code: string;
    dto: RegisterUserDTO;
}

export class RegistrationTempService {
    async save(data: TempRedisData){
        await redis.set(
            `register:${data.email}`,
            JSON.stringify(data),
            "EX",
            600
        )
    }


    async get(email: string): Promise<TempRedisData | null>{
        const raw = await redis.get(`register:${email}`);
        if(!raw) return null;

        return JSON.parse(raw)
    }

    async delete(email:string){
        await redis.del(`register:${email}`)
    }
}
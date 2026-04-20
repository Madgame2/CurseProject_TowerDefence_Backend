import { Body, Controller, Post } from "@nestjs/common";
import { CreateSessionRequest } from "./dto/createSessionRequestDTO";
import { EntryPointService } from "./EntryPoint.service";



@Controller("EntryPoint")
export class EntryPointController{

    constructor(private readonly service: EntryPointService){}

    @Post()
    async CreateSessionReserv(@Body() req: CreateSessionRequest ){
            return await this.service.tryCreateSessionReserv(req);
    }
}
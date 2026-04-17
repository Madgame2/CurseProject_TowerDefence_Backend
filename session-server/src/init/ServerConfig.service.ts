import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServerConfig } from "src/types/ServerConfig";

@Injectable()
export class ServerConfigService {
    public readonly config: ServerConfig;

    constructor(private readonly configService: ConfigService) {
        this.config = {
            serverId: this.configService.get("SERVER_ID")!,
            host: this.configService.get<string>('HOST')!,
            port: Number(this.configService.get<number>('PORT')),
            maxLoad: Number(this.configService.get<number>('MAX_LOAD')),
        };
    }
}
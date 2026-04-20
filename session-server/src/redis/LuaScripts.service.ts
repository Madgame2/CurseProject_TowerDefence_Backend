import { Injectable, OnModuleInit } from "@nestjs/common";
import fs from "fs";
import path from "path";
import { RedisService } from "./redis.service";



@Injectable()
export class LuaScripts implements OnModuleInit {
  public registerServerSha: string = "";
  public createSessioMetaDataSha: string =""

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.loadScripts();
  }

  private async loadScripts() {
    const client = this.redisService.getClient();

    const script = fs.readFileSync(
      path.join(process.cwd(), "LuaScripts/registerServer.lua"),
      "utf-8"
    );
    const SessionMetaDataScript = fs.readFileSync(
      path.join(process.cwd(), "LuaScripts/createSessionMetaData.lua"),
      "utf-8"
    );

    this.registerServerSha = (await client.script("LOAD", script)) as string;
    this.createSessioMetaDataSha = (await client.script("LOAD", SessionMetaDataScript)) as string;
  }
}
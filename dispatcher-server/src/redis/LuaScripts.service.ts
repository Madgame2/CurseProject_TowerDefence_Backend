import { Injectable, OnModuleInit } from "@nestjs/common";
import fs from "fs";
import path from "path";
import { RedisService } from "./redis.service";



@Injectable()
export class LuaScripts implements OnModuleInit {
  public takeTaskSha: string = "";
  public serverRadykSha: string = "";

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.loadScripts();
  }

  private async loadScripts() {
    const client = this.redisService.getClient();

    const script = fs.readFileSync(
      path.join(process.cwd(), "LuaScripts/TakeTask.lua"),
      "utf-8"
    );

    const ServerReadyScript = fs.readFileSync(
      path.join(process.cwd(), "LuaScripts/serverReadyReccords.lua"),
      "utf-8"
    );

    this.takeTaskSha = (await client.script("LOAD", script)) as string;
    this.serverRadykSha = (await client.script("LOAD", ServerReadyScript)) as string;
  }
}
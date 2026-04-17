import { Injectable, OnModuleInit } from "@nestjs/common";
import fs from "fs";
import path from "path";
import { RedisService } from "./redis.service";



@Injectable()
export class LuaScripts implements OnModuleInit {

  public returnToQeueueSha: string = "";

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    await this.loadScripts();
  }

  private async loadScripts() {
    const client = this.redisService.getClient();

    const script = fs.readFileSync(
      path.join(process.cwd(), "LuaScripts/ReturnToQeueue.lua"),
      "utf-8"
    );

    this.returnToQeueueSha = (await client.script("LOAD", script)) as string;
  }
}
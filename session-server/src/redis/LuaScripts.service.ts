import { Injectable, OnModuleInit } from "@nestjs/common";
import fs from "fs";
import path from "path";
import { RedisService } from "./redis.service";



@Injectable()
export class LuaScripts implements OnModuleInit {
  public registerServerSha: string = "";
  public createSessioMetaDataSha: string =""
  public DeleteSessionRecordsSha: string =""

  private initPromise!: Promise<void>;

  constructor(private readonly redisService: RedisService) {

  }

  async onModuleInit() {
    this.initPromise = this.loadScripts();
    return this.initPromise;
  }

  async ensureReady() {
    await this.initPromise;
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


    const DeleteRecorkdsScript = fs.readFileSync(
      path.join(process.cwd(), "LuaScripts/removeSession.lua"),
      "utf-8"
    );

    
    this.registerServerSha = (await client.script("LOAD", script)) as string;
    this.createSessioMetaDataSha = (await client.script("LOAD", SessionMetaDataScript)) as string;
    this.DeleteSessionRecordsSha = (await client.script("LOAD", DeleteRecorkdsScript)) as string
    
  }
}
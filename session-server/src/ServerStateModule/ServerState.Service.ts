import { Injectable } from "@nestjs/common";
import { ServerConfigService } from "src/init/ServerConfig.service";
import { serverStatus } from "src/types/serverStatuses.enum";



@Injectable()
export class ServerStateService{

    private maxSessions : number;
    private currentSessions: number = 0;

    private canAccept:boolean;

    private serverStatus: serverStatus;

    constructor(private readonly configs: ServerConfigService){
        const config = configs.config;

        this.maxSessions = config.maxLoad;
        this.canAccept = config.canAccept;
        this.serverStatus = config.status;
    }


    CanAccept():boolean{
        return (this.canAccept===true 
            && this.serverStatus === serverStatus.ONLINE&&
            this.currentSessions<this.maxSessions)
    }

    addSession(){
        if (!this.CanAccept()) {
      throw new Error('Server cannot accept new sessions');
    }

        this.currentSessions++;
    }

    removeSession() {
        this.currentSessions--;
    }

    getStatus(): serverStatus {
        return this.serverStatus;
    }
}
import { Injectable, OnModuleInit } from "@nestjs/common";



@Injectable()
export class LiveHeatBeatService {
  private lastPingMap = new Map<string, number>();

  setPing(clientId: string) {
    this.lastPingMap.set(clientId, Date.now());
  }

  getLastPing(clientId: string) {
    return this.lastPingMap.get(clientId) ?? 0;
  }

  removeClient(clientId: string) {
    this.lastPingMap.delete(clientId);
  }

  getDeadClients(timeoutMs: number): string[] {
    const now = Date.now();
    const dead: string[] = [];

    for (const [clientId, lastPing] of this.lastPingMap.entries()) {
      if (now - lastPing > timeoutMs) {
        dead.push(clientId);
      }
    }

    return dead;
  } 
}
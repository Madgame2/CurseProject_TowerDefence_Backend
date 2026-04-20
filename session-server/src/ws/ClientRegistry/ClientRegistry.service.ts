import { Injectable } from "@nestjs/common";


@Injectable()
export class ClientRegistryService{
   private clients = new Map<string, any>(); // лучше типизировать

  addClient(userId: string, client: any) {
    this.clients.set(userId, client);
  }

  getClient(userId: string) {
    return this.clients.get(userId);
  }

  removeClient(userId: string) {
    this.clients.delete(userId);
  }

  hasClient(userId: string): boolean {
    return this.clients.has(userId);
  }

  getAllClients() {
    return this.clients;
  }  
}
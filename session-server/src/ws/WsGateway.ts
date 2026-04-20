import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection
} from '@nestjs/websockets';
import { ClientRegistryService } from 'src/ws/ClientRegistry/ClientRegistry.service';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({
  path: '/ws',
})
export class WsGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  constructor(private registry: ClientRegistryService){}

  handleConnection(client: WebSocket) {
    console.log('Client connected');
    const userId = this.extractUserId(client);

    this.registry.addClient(userId, client);

    client.on('message', (msg) => {
      console.log('Message:', msg.toString());
    });

    client.send('Hello from NestJS WS');
  }

  handleDisconnect(client: any) {
    const userId = this.extractUserId(client);

    this.registry.removeClient(userId);
  }

  private extractUserId(client: any): string {
    return client.handshake?.query?.userId; // пример
  }
}
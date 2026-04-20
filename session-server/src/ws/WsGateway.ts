import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection
} from '@nestjs/websockets';
import { LiveHeatBeatService } from 'src/LiveheartBeat/liveheartBeat.service';
import { ClientRegistryService } from 'src/ws/ClientRegistry/ClientRegistry.service';
import { Server, WebSocket } from 'ws';
import { WSContext } from './Types/WsContext';
import { WsMiddlewareRunner } from './Midleware/wsMidlewar.service';
import { ConnectionAuthMiddleware } from './Midleware/ConnectionAuthMiddleware/ConnectionAuthMiddleware.module';

@WebSocketGateway({
  path: '/ws',
})
export class WsGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  constructor(private registry: ClientRegistryService,
    private liveService: LiveHeatBeatService,
    private  wsMiddleware: WsMiddlewareRunner,
    private readonly auth: ConnectionAuthMiddleware,
  ){}

  async handleConnection(ws: WebSocket, req) {
    console.log('Client connected');
    const ctx: WSContext = { ws, req };

    await this.wsMiddleware.run(ctx,[
      this.auth
    ])

    this.registry.addClient(ctx.userId!, ctx);

    ws.on('message', (msg) => {
      console.log('Message:', msg.toString());
    });

    ws.send('Hello from NestJS WS');
  }

  handleDisconnect(client: any) {
    const userId = this.extractUserId(client);

    this.registry.removeClient(userId);
  }

  private extractUserId(client: any): string {
    return client.handshake?.query?.userId; // пример
  }
}
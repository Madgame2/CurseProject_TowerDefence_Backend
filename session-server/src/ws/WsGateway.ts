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
import { parseMessageMiddleware } from './Midleware/parseMessageMidleware/ParsseMessageMidleware';
import { PingPongMiddleware } from './Midleware/PingPongMidleware/pingPongMidleware';
import { SesionManager } from 'src/sessions/sessionManager/sessionManager';

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
    private readonly parseMessaage: parseMessageMiddleware,
    private readonly PingPong: PingPongMiddleware,
    private readonly sessionManager: SesionManager,
  ){}

  async handleConnection(ws: WebSocket, req) {
    console.log('Client connected');
    const ctx: WSContext = { ws, req };

    await this.wsMiddleware.run(ctx,[
      this.auth
    ])

    this.registry.addClient(ctx.userId!, ctx);

    ws.on('message',async (data) => {
        const messageCtx: WSContext = {
          ...ctx, 
          rawMessage: data.toString(),
        };

      await this.wsMiddleware.run(messageCtx,[
        this.parseMessaage,
        this.PingPong
      ]);

      console.log(data);
    });

    ws.on('close',async ()=>{
        this.sessionManager.removeClient(ctx.sessionId!, ctx.userId!)
    })
  }
}
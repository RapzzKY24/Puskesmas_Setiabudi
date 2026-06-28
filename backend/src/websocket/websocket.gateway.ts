import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebSocket, WebSocketServer as WsServer } from 'ws';
import { IncomingMessage } from 'http';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/ws',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: WsServer;

  private userSockets = new Map<string, Set<WebSocket>>();
  private poliRooms = new Map<string, Set<WebSocket>>();

  constructor(private readonly jwt: JwtService) {}

  handleConnection(client: WebSocket, req: IncomingMessage) {
    const host = req.headers.host ?? 'localhost';
    const url = new URL(req.url ?? '/', `http://${host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      client.close(4001, 'Token required');
      return;
    }

    try {
      const payload = this.jwt.verify<{ sub: string; role: string }>(token);
      (client as any).userId = payload.sub;
      (client as any).role = payload.role;

      const userId = payload.sub;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client);
    } catch {
      client.close(4001, 'Invalid token');
    }
  }

  handleDisconnect(client: WebSocket) {
    const userId = (client as any).userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
    }

    for (const [, sockets] of this.poliRooms) {
      sockets.delete(client);
    }
  }

  @SubscribeMessage('join:poli')
  handleJoinPoli(client: WebSocket, payload: { poliId: string }) {
    if (!payload?.poliId) return;
    if (!this.poliRooms.has(payload.poliId)) {
      this.poliRooms.set(payload.poliId, new Set());
    }
    this.poliRooms.get(payload.poliId)!.add(client);
  }

  @SubscribeMessage('leave:poli')
  handleLeavePoli(client: WebSocket, payload: { poliId: string }) {
    if (!payload?.poliId) return;
    const sockets = this.poliRooms.get(payload.poliId);
    if (sockets) {
      sockets.delete(client);
      if (sockets.size === 0) this.poliRooms.delete(payload.poliId);
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    const message = JSON.stringify({ event, data });
    for (const client of sockets) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  emitToPoliRoom(poliId: string, event: string, data: unknown) {
    const sockets = this.poliRooms.get(poliId);
    if (!sockets) return;
    const message = JSON.stringify({ event, data });
    for (const client of sockets) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}

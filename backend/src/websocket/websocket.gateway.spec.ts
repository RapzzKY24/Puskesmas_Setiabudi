import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { WebsocketGateway } from './websocket.gateway';

type MockSocket = {
  close: jest.Mock;
  send: jest.Mock;
  readyState: number;
  userId?: string;
  role?: string;
};

function createMockSocket(): MockSocket {
  return {
    close: jest.fn(),
    send: jest.fn(),
    readyState: WebSocket.OPEN,
  };
}

function createMockRequest(url: string): IncomingMessage {
  return {
    url,
    headers: { host: 'localhost:3000' },
  } as any;
}

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;
  let jwt: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        {
          provide: JwtService,
          useValue: { verify: jest.fn() },
        },
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('handleConnection', () => {
    it('should accept connection with valid token and join user room', () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'user-1', role: 'PATIENT' });
      const client = createMockSocket();
      const req = createMockRequest('/ws?token=valid-jwt');

      gateway.handleConnection(client as any, req);

      expect((client as any).userId).toBe('user-1');
      expect(client.close).not.toHaveBeenCalled();
    });

    it('should close connection when token is missing', () => {
      const client = createMockSocket();
      const req = createMockRequest('/ws');

      gateway.handleConnection(client as any, req);

      expect(client.close).toHaveBeenCalledWith(4001, 'Token required');
    });

    it('should close connection when token is invalid', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('Invalid token'); });
      const client = createMockSocket();
      const req = createMockRequest('/ws?token=bad-token');

      gateway.handleConnection(client as any, req);

      expect(client.close).toHaveBeenCalledWith(4001, 'Invalid token');
    });
  });

  describe('handleDisconnect', () => {
    it('should clean up user rooms on disconnect', () => {
      const client = createMockSocket();
      (client as any).userId = 'user-1';

      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'user-1', role: 'PATIENT' });
      gateway.handleConnection(client as any, createMockRequest('/ws?token=valid'));

      const secondClient = createMockSocket();
      (secondClient as any).userId = 'user-2';
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'user-2', role: 'PATIENT' });
      gateway.handleConnection(secondClient as any, createMockRequest('/ws?token=valid2'));

      gateway.handleDisconnect(client as any);

      gateway.emitToUser('user-1', 'test', {});
      expect(client.send).not.toHaveBeenCalled();
    });
  });

  describe('join:poli / leave:poli', () => {
    it('should add client to poli room on join:poli', () => {
      const client = createMockSocket();
      gateway.handleJoinPoli(client as any, { poliId: 'poli-1' });

      const data = { msg: 'hello' };
      gateway.emitToPoliRoom('poli-1', 'queue:updated', data);

      expect(client.send).toHaveBeenCalledWith(JSON.stringify({ event: 'queue:updated', data }));
    });

    it('should remove client from poli room on leave:poli', () => {
      const client = createMockSocket();
      gateway.handleJoinPoli(client as any, { poliId: 'poli-1' });
      gateway.handleLeavePoli(client as any, { poliId: 'poli-1' });

      gateway.emitToPoliRoom('poli-1', 'queue:updated', {});

      expect(client.send).not.toHaveBeenCalled();
    });

    it('should ignore join:poli with empty payload', () => {
      const client = createMockSocket();
      gateway.handleJoinPoli(client as any, null as any);
      gateway.emitToPoliRoom('poli-1', 'queue:updated', {});

      expect(client.send).not.toHaveBeenCalled();
    });
  });

  describe('emitToUser', () => {
    it('should send message to matching user sockets', () => {
      const client = createMockSocket();
      (client as any).userId = 'user-1';
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 'user-1', role: 'PATIENT' });
      gateway.handleConnection(client as any, createMockRequest('/ws?token=valid'));

      gateway.emitToUser('user-1', 'notification:new', { title: 'Test' });

      expect(client.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'notification:new', data: { title: 'Test' } }),
      );
    });

    it('should not send when user has no sockets', () => {
      gateway.emitToUser('unknown-user', 'test', {});
    });
  });

  describe('emitToPoliRoom', () => {
    it('should send message to all sockets in poli room', () => {
      const client1 = createMockSocket();
      const client2 = createMockSocket();
      gateway.handleJoinPoli(client1 as any, { poliId: 'poli-1' });
      gateway.handleJoinPoli(client2 as any, { poliId: 'poli-1' });

      gateway.emitToPoliRoom('poli-1', 'queue:updated', { count: 5 });

      expect(client1.send).toHaveBeenCalled();
      expect(client2.send).toHaveBeenCalled();
    });

    it('should not send when poli room has no sockets', () => {
      gateway.emitToPoliRoom('empty-room', 'test', {});
    });
  });
});

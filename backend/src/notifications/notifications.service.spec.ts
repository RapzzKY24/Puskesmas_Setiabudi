import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockWsGateway } from '../../test/mocks/ws-gateway.mock';
import { mockNotification } from '../../test/factories/data.factory';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WebsocketGateway, useValue: mockWsGateway },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = mockPrisma;
  });

  describe('findByUser', () => {
    it('should return notifications for a user ordered by createdAt desc', async () => {
      const notifications = [
        mockNotification({ id: 'n1', createdAt: new Date('2026-06-28T10:00:00Z') }),
        mockNotification({ id: 'n2', createdAt: new Date('2026-06-28T09:00:00Z') }),
      ];
      prisma.notification.findMany.mockResolvedValue(notifications);

      const result = await service.findByUser('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('markRead', () => {
    it('should update readAt for matching notification', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });

      await service.markRead('n1', 'user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'n1', userId: 'user-1' },
        data: { readAt: expect.any(Date) },
      });
    });

    it('should not throw when notification does not exist', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.markRead('nonexistent', 'user-1')).resolves.not.toThrow();
    });
  });
});

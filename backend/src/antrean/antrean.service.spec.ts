import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AntreanService } from './antrean.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockWsGateway } from '../../test/mocks/ws-gateway.mock';
import { mockAntrean, mockPoli, mockAppointment } from '../../test/factories/data.factory';

describe('AntreanService', () => {
  let service: AntreanService;
  let prisma: typeof mockPrisma;
  let ws: typeof mockWsGateway;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AntreanService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WebsocketGateway, useValue: mockWsGateway },
      ],
    }).compile();

    service = module.get<AntreanService>(AntreanService);
    prisma = mockPrisma;
    ws = mockWsGateway;
  });

  describe('getActive', () => {
    it('should return active antrean when found', async () => {
      const expected = mockAntrean();
      prisma.antrean.findFirst.mockResolvedValue(expected);

      const result = await service.getActive('user-1');

      expect(prisma.antrean.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } },
        include: { poli: true, appointment: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(expected);
    });

    it('should return null when no active antrean', async () => {
      prisma.antrean.findFirst.mockResolvedValue(null);

      const result = await service.getActive('user-999');

      expect(result).toBeNull();
    });
  });

  describe('getMyQueueInfo', () => {
    it('should return null defaults when no active antrean', async () => {
      prisma.antrean.findFirst.mockResolvedValue(null);

      const result = await service.getMyQueueInfo('user-999');

      expect(result).toEqual({
        antrean: null,
        queueAhead: 0,
        totalQueue: 0,
        position: 0,
        currentServing: null,
        estWaitMin: 0,
        estWaitLabel: '-',
      });
    });

    it('should return correct queue info with people ahead', async () => {
      const antrean = mockAntrean({
        poli: mockPoli({ estWait: 30 }),
        createdAt: new Date('2026-06-28T08:05:00Z'),
      });
      prisma.antrean.findFirst.mockResolvedValue(antrean);
      prisma.antrean.count
        .mockResolvedValueOnce(3)   // queueAhead
        .mockResolvedValueOnce(5);  // totalQueue
      prisma.antrean.findFirst.mockResolvedValueOnce(antrean)
        .mockResolvedValueOnce(mockAntrean({ nomor: 'UMUM-003', status: 'IN_SERVICE' }));

      const result = await service.getMyQueueInfo('user-1');

      expect(result.queueAhead).toBe(3);
      expect(result.totalQueue).toBe(5);
      expect(result.position).toBe(4);
      expect(result.currentServing).toBe('UMUM-003');
      expect(result.estWaitMin).toBe(120);  // 4 × 30
      expect(result.estWaitLabel).toBe('Estimasi dilayani pukul 10.00 WIB');
    });

    it('should return position 1 when no one ahead', async () => {
      const antrean = mockAntrean({
        poli: mockPoli({ estWait: 30 }),
        createdAt: new Date('2026-06-28T08:00:00Z'),
      });
      prisma.antrean.findFirst.mockResolvedValue(antrean);
      prisma.antrean.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(1);
      prisma.antrean.findFirst
        .mockResolvedValueOnce(antrean)
        .mockResolvedValueOnce(null);

      const result = await service.getMyQueueInfo('user-1');

      expect(result.position).toBe(1);
      expect(result.currentServing).toBeNull();
      expect(result.estWaitLabel).toBe('Estimasi dilayani pukul 08.30 WIB');
    });

    it('should use poli estWait for estimation', async () => {
      const antrean = mockAntrean({
        poli: mockPoli({ estWait: 15 }),
        createdAt: new Date('2026-06-28T08:05:00Z'),
      });
      prisma.antrean.findFirst.mockResolvedValue(antrean);
      prisma.antrean.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(5);
      prisma.antrean.findFirst
        .mockResolvedValueOnce(antrean)
        .mockResolvedValueOnce(null);

      const result = await service.getMyQueueInfo('user-1');

      expect(result.estWaitMin).toBe(75);  // 5 × 15
      expect(result.estWaitLabel).toBe('Estimasi dilayani pukul 09.15 WIB');
    });

    it('should handle case where poli is null gracefully', async () => {
      const antrean = mockAntrean({ poli: null });
      prisma.antrean.findFirst.mockResolvedValue(antrean);
      prisma.antrean.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3);
      prisma.antrean.findFirst
        .mockResolvedValueOnce(antrean)
        .mockResolvedValueOnce(null);

      const result = await service.getMyQueueInfo('user-1');

      expect(result.estWaitMin).toBe(45);  // 3 × 15 (default)
      expect(result.estWaitLabel).toBe('Estimasi dilayani pukul 08.45 WIB');
    });
  });

  describe('findOne', () => {
    it('should return antrean with includes when found', async () => {
      const expected = mockAntrean();
      prisma.antrean.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('antrean-1');

      expect(prisma.antrean.findUnique).toHaveBeenCalledWith({
        where: { id: 'antrean-1' },
        include: { poli: true, user: true, appointment: true },
      });
      expect(result).toEqual(expected);
    });

    it('should return null when not found', async () => {
      prisma.antrean.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all active antrean without poliId filter', async () => {
      const list = [mockAntrean({ id: 'a1' }), mockAntrean({ id: 'a2' })];
      prisma.antrean.findMany.mockResolvedValue(list);

      const result = await service.findAll();

      expect(prisma.antrean.findMany).toHaveBeenCalledWith({
        where: { status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } },
        include: { poli: true, user: true, appointment: true },
        orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
      });
      expect(result).toHaveLength(2);
    });

    it('should filter by poliId when provided', async () => {
      prisma.antrean.findMany.mockResolvedValue([]);

      await service.findAll('poli-1');

      const call = prisma.antrean.findMany.mock.calls[0][0];
      expect(call.where.poliId).toBe('poli-1');
    });

    it('should return empty array when no matches', async () => {
      prisma.antrean.findMany.mockResolvedValue([]);

      const result = await service.findAll('poli-nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getStatus', () => {
    it('should return dash when no one is being served', async () => {
      prisma.antrean.findFirst.mockResolvedValue(null);

      const result = await service.getStatus('poli-1');

      expect(result.sedangDilayani).toBe('-');
      expect(result.estimasi).toBe('Estimasi dilayani pukul 08.00 WIB');
    });

    it('should return current serving number when someone is in service', async () => {
      const inService = mockAntrean({ nomor: 'UMUM-003', status: 'IN_SERVICE' });
      prisma.antrean.findFirst.mockResolvedValue(inService);

      const result = await service.getStatus('poli-1');

      expect(result.sedangDilayani).toBe('UMUM-003');
    });

    it('should calculate estimation correctly with antreanId', async () => {
      prisma.antrean.findFirst.mockResolvedValue(mockAntrean({ nomor: 'UMUM-003', status: 'IN_SERVICE' }));
      const target = mockAntrean({ id: 'antrean-5', createdAt: new Date('2026-06-28T08:30:00Z') });
      prisma.antrean.findUnique.mockResolvedValue(target);
      prisma.antrean.count.mockResolvedValue(2);

      const result = await service.getStatus('poli-1', 'antrean-5');

      // position = 3, totalMenit = 3 × 30 = 90 → 09.30
      expect(result.estimasi).toBe('Estimasi dilayani pukul 09.30 WIB');
    });

    it('should return 08.00 when no antreanId (default)', async () => {
      prisma.antrean.findFirst.mockResolvedValue(mockAntrean({ nomor: 'UMUM-003', status: 'IN_SERVICE' }));

      const result = await service.getStatus('poli-1');

      expect(result.estimasi).toBe('Estimasi dilayani pukul 08.00 WIB');
    });

    it('should handle antrean with null poli gracefully', async () => {
      prisma.antrean.findFirst.mockResolvedValue(mockAntrean({ nomor: 'UMUM-003', status: 'IN_SERVICE' }));
      prisma.antrean.findUnique.mockResolvedValue(mockAntrean({ poli: null }));
      prisma.antrean.count.mockResolvedValue(2);

      const result = await service.getStatus('poli-1', 'antrean-5');

      expect(result.estimasi).toBe('Estimasi dilayani pukul 08.00 WIB');
    });
  });

  describe('updateStatus', () => {
    const antreanBefore = mockAntrean({
      status: 'WAITING' as const,
      calledAt: null,
      serviceStartedAt: null,
      completedAt: null,
      cancelledAt: null,
      poli: mockPoli({ name: 'Poli Umum' }),
    });

    it('should transition WAITING → CALLED and set calledAt and create notification', async () => {
      prisma.antrean.findUnique.mockResolvedValue(antreanBefore);
      const updated = mockAntrean({ status: 'CALLED', calledAt: new Date() });
      prisma.antrean.update.mockResolvedValue(updated);
      const notif = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'antrean',
        category: 'Antrean',
        categoryColor: '#0891b2',
        title: 'Anda Dipanggil',
        description: 'Silakan menuju Poli Umum',
        icon: 'megaphone-outline',
        iconBg: '#e0f2fe',
        accentBorder: true,
      };
      prisma.notification.create.mockResolvedValue(notif);

      const result = await service.updateStatus('antrean-1', 'CALLED');

      expect(prisma.antrean.update).toHaveBeenCalledWith({
        where: { id: 'antrean-1' },
        data: { status: 'CALLED', calledAt: expect.any(Date) },
        include: { poli: true, user: true, appointment: true },
      });
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('should transition CALLED → IN_SERVICE and sync appointment to IN_PROGRESS', async () => {
      const before = mockAntrean({ status: 'CALLED', calledAt: new Date(), appointment: mockAppointment({ id: 'appt-1' }) });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ status: 'IN_SERVICE', calledAt: new Date(), serviceStartedAt: new Date() });
      prisma.antrean.update.mockResolvedValue(updated);
      prisma.notification.create.mockResolvedValue({});

      const result = await service.updateStatus('antrean-1', 'IN_SERVICE');

      expect(prisma.antrean.update).toHaveBeenCalledWith({
        where: { id: 'antrean-1' },
        data: { status: 'IN_SERVICE', serviceStartedAt: expect.any(Date) },
        include: { poli: true, user: true, appointment: true },
      });
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { status: 'IN_PROGRESS' },
      });
      expect(result.status).toBe('IN_SERVICE');
    });

    it('should skip appointment sync when antrean has no linked appointment', async () => {
      const before = mockAntrean({ appointment: null });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ appointment: null, status: 'IN_SERVICE' });
      prisma.antrean.update.mockResolvedValue(updated);
      prisma.notification.create.mockResolvedValue({});

      await service.updateStatus('antrean-1', 'IN_SERVICE');

      expect(prisma.appointment.update).not.toHaveBeenCalled();
    });

    it('should transition IN_SERVICE → COMPLETED, sync appointment status', async () => {
      const before = mockAntrean({ status: 'IN_SERVICE', appointment: mockAppointment({ id: 'appt-1' }) });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ status: 'COMPLETED', completedAt: new Date() });
      prisma.antrean.update.mockResolvedValue(updated);
      prisma.appointment.update.mockResolvedValue(mockAppointment({ status: 'COMPLETED' }));
      prisma.notification.create.mockResolvedValue({});

      await service.updateStatus('antrean-1', 'COMPLETED');

      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { status: 'COMPLETED' },
      });
    });

    it('should transition IN_SERVICE → CANCELLED without notification', async () => {
      const before = mockAntrean({ status: 'IN_SERVICE' });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ status: 'CANCELLED', cancelledAt: new Date() });
      prisma.antrean.update.mockResolvedValue(updated);

      await service.updateStatus('antrean-1', 'CANCELLED');

      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should transition WAITING → NO_SHOW without notification', async () => {
      const before = mockAntrean({ status: 'WAITING' });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ status: 'NO_SHOW', cancelledAt: new Date() });
      prisma.antrean.update.mockResolvedValue(updated);

      await service.updateStatus('antrean-1', 'NO_SHOW');

      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when antrean does not exist', async () => {
      prisma.antrean.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('nonexistent', 'CALLED')).rejects.toThrow(NotFoundException);
    });

    it('should handle status not in timestampData gracefully (WAITING has no timestamp)', async () => {
      const before = mockAntrean({ status: 'WAITING' });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ status: 'WAITING' });
      prisma.antrean.update.mockResolvedValue(updated);

      await service.updateStatus('antrean-1', 'WAITING');

      expect(prisma.antrean.update).toHaveBeenCalledWith({
        where: { id: 'antrean-1' },
        data: { status: 'WAITING' },
        include: { poli: true, user: true, appointment: true },
      });
    });

    it('should always emit WS events after update', async () => {
      const before = mockAntrean({ status: 'WAITING' });
      prisma.antrean.findUnique.mockResolvedValue(before);
      const updated = mockAntrean({ status: 'CALLED' });
      prisma.antrean.update.mockResolvedValue(updated);
      prisma.notification.create.mockResolvedValue({});

      await service.updateStatus('antrean-1', 'CALLED');

      expect(ws.emitToUser).toHaveBeenCalledWith('user-1', 'antrean:updated', updated);
      expect(ws.emitToPoliRoom).toHaveBeenCalledWith('poli-1', 'queue:updated', {
        poliId: 'poli-1',
        antreanId: 'antrean-1',
        status: 'CALLED',
      });
    });

    it('should emit notification:new when notification is created', async () => {
      const before = mockAntrean({ status: 'WAITING' });
      prisma.antrean.findUnique.mockResolvedValue(before);
      prisma.antrean.update.mockResolvedValue(mockAntrean({ status: 'CALLED' }));
      const notif = { id: 'notif-1', title: 'Anda Dipanggil' };
      prisma.notification.create.mockResolvedValue(notif);

      await service.updateStatus('antrean-1', 'CALLED');

      expect(ws.emitToUser).toHaveBeenCalledWith('user-1', 'notification:new', notif);
    });
  });
});

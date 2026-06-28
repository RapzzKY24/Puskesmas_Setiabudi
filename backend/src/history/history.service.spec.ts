import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockAppointment } from '../../test/factories/data.factory';

describe('HistoryService', () => {
  let service: HistoryService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    prisma = mockPrisma;
  });

  describe('findByUser', () => {
    it('should return formatted history items', async () => {
      const appointments = [
        mockAppointment({
          id: 'a1',
          tanggal: new Date('2026-06-28T09:00:00Z'),
          status: 'COMPLETED',
          poli: { id: 'p1', name: 'Poli Umum' },
        }),
        mockAppointment({
          id: 'a2',
          tanggal: new Date('2026-06-27T10:30:00Z'),
          status: 'CANCELLED',
          poli: { id: 'p2', name: 'Poli Gigi' },
        }),
      ];
      prisma.appointment.findMany.mockResolvedValue(appointments);

      const result = await service.findByUser('user-1');

      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { poli: true },
        orderBy: { tanggal: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].poliName).toBe('Poli Umum');
      expect(result[0].status).toBe('COMPLETED');
      expect(result[1].poliName).toBe('Poli Gigi');
      expect(result[1].status).toBe('CANCELLED');
      expect(result[0].date).toBeDefined();
      expect(result[0].time).toContain('WIB');
    });
  });
});

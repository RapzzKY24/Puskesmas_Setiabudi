import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PoliService } from './poli.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockPoli } from '../../test/factories/data.factory';
import { AntreanService } from '../antrean/antrean.service';
import { Prisma } from '@prisma/client';

describe('PoliService', () => {
  let service: PoliService;
  let prisma: typeof mockPrisma;

  const mockAntreanService = {
    autoExpire: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AntreanService, useValue: mockAntreanService },
      ],
    }).compile();

    service = module.get<PoliService>(PoliService);
    prisma = mockPrisma;
  });

  describe('findAll', () => {
    it('should return active polis with queueCount by default', async () => {
      const polis = [mockPoli({ id: 'p1' }), mockPoli({ id: 'p2' })];
      prisma.poli.findMany.mockResolvedValue(polis);
      prisma.antrean.findMany.mockResolvedValue([
        { poliId: 'p1' }, { poliId: 'p1' }, { poliId: 'p1' },
      ]);

      const result = await service.findAll();

      expect(prisma.poli.findMany).toHaveBeenCalledWith({ where: { active: true } });
      expect(result).toHaveLength(2);
      expect(result[0].queueCount).toBe(3);
      expect(result[1].queueCount).toBe(0);
    });

    it('should include inactive polis when includeInactive is true', async () => {
      prisma.poli.findMany.mockResolvedValue([]);
      prisma.antrean.findMany.mockResolvedValue([]);

      await service.findAll(true);

      expect(prisma.poli.findMany).toHaveBeenCalledWith({ where: {} });
    });

    it('should handle empty result gracefully', async () => {
      prisma.poli.findMany.mockResolvedValue([]);
      prisma.antrean.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return poli when found', async () => {
      prisma.poli.findUnique.mockResolvedValue(mockPoli());

      const result = await service.findOne('poli-1');

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.poli.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new poli', async () => {
      const data = { code: 'GIGI', name: 'Poli Gigi', icon: 'tooth', iconBg: '#fff', desc: 'Layanan gigi', estWait: 20, active: true };
      prisma.poli.create.mockResolvedValue(mockPoli({ ...data }));

      const result = await service.create(data);

      expect(prisma.poli.create).toHaveBeenCalledWith({ data });
      expect(result).toBeDefined();
    });

    it('should throw ConflictException on duplicate code', async () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '5' });
      prisma.poli.create.mockRejectedValue(error);

      await expect(service.create({ code: 'UMUM' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update an existing poli', async () => {
      prisma.poli.findUnique.mockResolvedValue(mockPoli());
      prisma.poli.update.mockResolvedValue(mockPoli({ name: 'Updated' }));

      const result = await service.update('poli-1', { name: 'Updated' });

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when updating non-existent poli', async () => {
      prisma.poli.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate code during update', async () => {
      prisma.poli.findUnique.mockResolvedValue(mockPoli());
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '5' });
      prisma.poli.update.mockRejectedValue(error);

      await expect(service.update('poli-1', { code: 'EXISTING' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft-delete by setting active=false', async () => {
      prisma.poli.findUnique.mockResolvedValue(mockPoli());
      prisma.poli.update.mockResolvedValue(mockPoli({ active: false }));

      const result = await service.remove('poli-1');

      expect(prisma.poli.update).toHaveBeenCalledWith({ where: { id: 'poli-1' }, data: { active: false } });
    });

    it('should throw NotFoundException when removing non-existent poli', async () => {
      prisma.poli.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});

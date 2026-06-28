import { Test, TestingModule } from '@nestjs/testing';
import { PromosService } from './promos.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockPromo } from '../../test/factories/data.factory';

describe('PromosService', () => {
  let service: PromosService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromosService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromosService>(PromosService);
    prisma = mockPrisma;
  });

  describe('findAll', () => {
    it('should return all promos', async () => {
      const promos = [mockPromo({ id: 'p1' }), mockPromo({ id: 'p2' })];
      prisma.promo.findMany.mockResolvedValue(promos);

      const result = await service.findAll();

      expect(prisma.promo.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no promos', async () => {
      prisma.promo.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});

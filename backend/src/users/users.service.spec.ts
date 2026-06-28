import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockUser } from '../../test/factories/data.factory';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = mockPrisma;
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());

      const result = await service.getProfile('user-1');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result?.nama).toBe('John Doe');
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update and return profile without password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser());
      const updated = { ...mockUser(), nama: 'Jane Doe' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.updateProfile('user-1', { nama: 'Jane Doe' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { nama: 'Jane Doe' },
      });
      expect(result).not.toHaveProperty('password');
      expect(result.nama).toBe('Jane Doe');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent', { nama: 'X' })).rejects.toThrow(NotFoundException);
    });
  });
});

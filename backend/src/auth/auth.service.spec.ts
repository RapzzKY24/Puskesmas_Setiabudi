import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockUser } from '../../test/factories/data.factory';
import * as bcrypt from 'bcryptjs';
import { RegisterRequestDto } from './dto/register-request.dto';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: typeof mockPrisma;
  let jwt: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = mockPrisma;
    jwt = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return token and user for valid NIK login', async () => {
      const user = mockUser();
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('1234567890123456', 'password123');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ nik: '1234567890123456' }, { noHp: '1234567890123456' }, { email: '1234567890123456' }] },
      });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: user.id, role: user.role });
      expect(result.token).toBe('mock-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should return token and user for valid noHp login', async () => {
      const user = mockUser();
      prisma.user.findFirst.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('08123456789', 'password123');

      expect(result.token).toBe('mock-token');
      expect(result.user.nama).toBe('John Doe');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login('unknown', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('1234567890123456', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const dto: RegisterRequestDto = { identifier: '1234567890123456', password: 'strongpass', nama: 'Jane Doe' };

    it('should create user with NIK when identifier is 16 digits', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$12$hashed');
      prisma.user.create.mockResolvedValue(mockUser());

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('strongpass', 12);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { nik: '1234567890123456', nama: 'Jane Doe', password: '$2a$12$hashed' },
      });
      expect(result.message).toContain('Registrasi berhasil');
    });

    it('should create user with noHp when identifier is not 16 digits', async () => {
      const dtoHp: RegisterRequestDto = { identifier: '08111111111', password: 'pass', nama: 'Test' };
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue(mockUser());

      await service.register(dtoHp);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { noHp: '08111111111', nama: 'Test', password: 'hashed' },
      });
    });

    it('should throw ConflictException when user already exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser());

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('should use empty string for nama when not provided', async () => {
      const dtoNoNama: RegisterRequestDto = { identifier: '1234567890123456', password: 'pass' };
      prisma.user.findFirst.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      prisma.user.create.mockResolvedValue(mockUser());

      await service.register(dtoNoNama);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { nik: '1234567890123456', nama: '', password: 'hashed' },
      });
    });
  });
});

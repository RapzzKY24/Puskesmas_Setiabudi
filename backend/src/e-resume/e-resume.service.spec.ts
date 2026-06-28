import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EResumeService } from './e-resume.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockAppointment } from '../../test/factories/data.factory';

describe('EResumeService', () => {
  let service: EResumeService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EResumeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EResumeService>(EResumeService);
    prisma = mockPrisma;
  });

  describe('findByAppointment', () => {
    it('should return e-resume when found', async () => {
      const eResume = {
        id: 'resume-1',
        appointmentId: 'appt-1',
        userId: 'user-1',
        diagnosa: 'Demam',
        deskripsi: 'Minum obat',
        createdAt: new Date(),
        updatedAt: new Date(),
        obat: [],
        appointment: { include: { poli: true } },
      };
      prisma.eResume.findUnique.mockResolvedValue(eResume);

      const result = await service.findByAppointment('appt-1');

      expect(prisma.eResume.findUnique).toHaveBeenCalledWith({
        where: { appointmentId: 'appt-1' },
        include: { obat: true, appointment: { include: { poli: true } } },
      });
      expect(result).toBeDefined();
    });

    it('should return null when not found', async () => {
      prisma.eResume.findUnique.mockResolvedValue(null);

      const result = await service.findByAppointment('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('should return list of e-resumes for user', async () => {
      const resumes = [
        { id: 'r1', appointmentId: 'a1', userId: 'user-1', diagnosa: 'A', deskripsi: 'B', createdAt: new Date(), updatedAt: new Date(), obat: [], appointment: { include: { poli: true } } },
      ];
      prisma.eResume.findMany.mockResolvedValue(resumes);

      const result = await service.findByUser('user-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create e-resume with obat when appointment exists', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment());
      const newResume = {
        id: 'resume-new',
        appointmentId: 'appt-1',
        userId: 'user-1',
        diagnosa: 'Flu',
        deskripsi: 'Istirahat',
        createdAt: new Date(),
        updatedAt: new Date(),
        obat: [{ id: 'obat-1', name: 'Paracetamol', rule: '3x1' }],
        appointment: mockAppointment(),
      };
      prisma.eResume.create.mockResolvedValue(newResume);

      const result = await service.create('user-1', {
        appointmentId: 'appt-1',
        diagnosa: 'Flu',
        deskripsi: 'Istirahat',
        obat: [{ name: 'Paracetamol', rule: '3x1' }],
      });

      expect(prisma.eResume.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          appointmentId: 'appt-1',
          diagnosa: 'Flu',
          deskripsi: 'Istirahat',
          obat: { create: [{ name: 'Paracetamol', rule: '3x1' }] },
        },
        include: { obat: true, appointment: { include: { poli: true } } },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when appointment not found', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', { appointmentId: 'nonexistent' } as any)).rejects.toThrow(NotFoundException);
    });
  });
});

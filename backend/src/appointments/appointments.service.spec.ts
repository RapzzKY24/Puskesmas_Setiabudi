import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { mockPrisma } from '../../test/mocks/prisma.service.mock';
import { mockPoli, mockAntrean, mockAppointment } from '../../test/factories/data.factory';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prisma: typeof mockPrisma;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prisma = mockPrisma;
  });

  describe('create', () => {
    const dto: CreateAppointmentRequestDto = {
      poliId: 'poli-1',
      tanggal: '2026-07-01T09:00:00.000Z',
      keluhan: 'Demam',
    };

    it('should create appointment, antrean, and notification', async () => {
      const poli = mockPoli();
      const todayCount = 0;
      prisma.poli.findUnique.mockResolvedValue(poli);
      prisma.antrean.count.mockResolvedValue(todayCount);
      prisma.appointment.create.mockResolvedValue(mockAppointment());
      prisma.antrean.create.mockResolvedValue(mockAntrean());
      prisma.notification.create.mockResolvedValue({});
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment({ antrean: mockAntrean(), poli }));

      const result = await service.create('user-1', dto);

      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(prisma.antrean.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          poliId: 'poli-1',
          appointmentId: expect.any(String),
          nomor: 'UMUM-001',
        },
      });
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should generate correct nomor with padded zero', async () => {
      prisma.poli.findUnique.mockResolvedValue(mockPoli({ code: 'GIGI' }));
      prisma.antrean.count.mockResolvedValue(5);
      prisma.appointment.create.mockResolvedValue(mockAppointment());
      prisma.antrean.create.mockResolvedValue(mockAntrean());
      prisma.notification.create.mockResolvedValue({});
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment());

      await service.create('user-1', { ...dto, poliId: 'poli-gigi' });

      expect(prisma.antrean.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nomor: 'GIGI-006' }),
        }),
      );
    });

    it('should throw NotFoundException when poli not found', async () => {
      prisma.poli.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when tanggal is invalid', async () => {
      prisma.poli.findUnique.mockResolvedValue(mockPoli());

      await expect(service.create('user-1', { ...dto, tanggal: 'invalid-date' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return appointment with includes when found', async () => {
      const appt = mockAppointment({ antrean: mockAntrean() });
      prisma.appointment.findUnique.mockResolvedValue(appt);

      const result = await service.findOne('appt-1');

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status', async () => {
      prisma.appointment.findUnique.mockResolvedValue(mockAppointment());
      prisma.appointment.update.mockResolvedValue(mockAppointment({ status: 'COMPLETED' }));

      const result = await service.updateStatus('appt-1', 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException when appointment not found', async () => {
      prisma.appointment.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('nonexistent', 'COMPLETED')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAvailableDates', () => {
    it('should return 14 dates starting from today', async () => {
      const result = await service.getAvailableDates('poli-1');

      expect(result.dates).toHaveLength(14);
      expect(result.dates[0].dayName).toBeDefined();
      expect(result.dates[0].date).toBeDefined();
      expect(result.dates[0].month).toBeDefined();
      expect(result.dates[0].full).toBeInstanceOf(Date);
    });
  });
});

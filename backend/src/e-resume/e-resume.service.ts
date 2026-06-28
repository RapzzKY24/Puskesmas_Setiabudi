import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEResumeRequestDto } from './dto/create-e-resume-request.dto';

@Injectable()
export class EResumeService {
  constructor(private readonly prisma: PrismaService) {}

  async findByAppointment(appointmentId: string) {
    return this.prisma.eResume.findUnique({
      where: { appointmentId },
      include: { obat: true, appointment: { include: { poli: true } } },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.eResume.findMany({
      where: { userId },
      include: { obat: true, appointment: { include: { poli: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: CreateEResumeRequestDto) {
    const appt = await this.prisma.appointment.findUnique({ where: { id: data.appointmentId } });
    if (!appt) throw new NotFoundException('Appointment tidak ditemukan');

    return this.prisma.eResume.create({
      data: {
        userId,
        appointmentId: data.appointmentId,
        diagnosa: data.diagnosa || null,
        deskripsi: data.deskripsi || null,
        obat: {
          create: data.obat || [],
        },
      },
      include: { obat: true, appointment: { include: { poli: true } } },
    });
  }
}

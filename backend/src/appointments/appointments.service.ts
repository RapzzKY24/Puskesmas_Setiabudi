import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateAppointmentRequestDto) {
    const poli = await this.prisma.poli.findUnique({ where: { id: data.poliId } });
    if (!poli) throw new NotFoundException('Poli tidak ditemukan');

    const tanggal = new Date(data.tanggal);
    if (isNaN(tanggal.getTime())) {
      throw new BadRequestException('Format tanggal tidak valid');
    }

    const dayStart = new Date(tanggal);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(tanggal);
    dayEnd.setHours(23, 59, 59, 999);

    const todayCount = await this.prisma.antrean.count({
      where: {
        poliId: data.poliId,
        createdAt: { gte: dayStart, lte: dayEnd },
      },
    });

    const nomor = `${poli.code}-${String(todayCount + 1).padStart(3, '0')}`;

    const appointment = await this.prisma.appointment.create({
      data: {
        userId,
        poliId: data.poliId,
        tanggal,
        keluhan: data.keluhan,
      },
    });

    await this.prisma.antrean.create({
      data: {
        userId,
        poliId: data.poliId,
        appointmentId: appointment.id,
        nomor,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'appointment',
        category: 'Janji Temu',
        categoryColor: '#0d9488',
        title: 'Antrean Berhasil Dibuat',
        description: `Nomor antrean ${nomor} di ${poli.name}`,
        icon: 'calendar-outline',
        iconBg: '#ccfbf1',
        accentBorder: true,
      },
    });

    return this.prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: { poli: true, antrean: true },
    });
  }

  async findOne(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { poli: true, user: true, antrean: true },
    });
    if (!appt) throw new NotFoundException('Appointment tidak ditemukan');
    return appt;
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appt = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appt) throw new NotFoundException('Appointment tidak ditemukan');

    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: { poli: true, antrean: true },
    });
  }

  async getAvailableDates(poliId: string) {
    const dates: { dayName: string; date: number; month: string; full: Date }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        dayName: days[d.getDay()],
        date: d.getDate(),
        month: months[d.getMonth()],
        full: d,
      });
    }

    return { dates };
  }
}

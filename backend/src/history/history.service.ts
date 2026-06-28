import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    const appointments = await this.prisma.appointment.findMany({
      where: { userId },
      include: { poli: true, antrean: true },
      orderBy: { tanggal: 'desc' },
    });

    return appointments.map((a) => ({
      id: a.id,
      poliName: a.poli.name,
      date: a.tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: a.tanggal.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: a.status,
      keluhan: a.keluhan,
      nomorAntrean: a.antrean?.nomor ?? '-',
    }));
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AntreanStatus, AppointmentStatus, Prisma } from '@prisma/client';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AntreanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  async getActive(userId: string) {
    return this.prisma.antrean.findFirst({
      where: { userId, status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } },
      include: { poli: true, appointment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyQueueInfo(userId: string) {
    const antrean = await this.prisma.antrean.findFirst({
      where: { userId, status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } },
      include: { poli: true, appointment: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!antrean) {
      return { antrean: null, queueAhead: 0, totalQueue: 0, position: 0, currentServing: null, estWaitMin: 0, estWaitLabel: '< 1 Menit' };
    }

    const apptTanggal = antrean.appointment?.tanggal;
    const dayStart = apptTanggal ? new Date(apptTanggal) : new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = apptTanggal ? new Date(apptTanggal) : new Date();
    dayEnd.setHours(23, 59, 59, 999);

    const queueAhead = await this.prisma.antrean.count({
      where: {
        poliId: antrean.poliId,
        status: { in: ['WAITING', 'CALLED'] },
        appointment: { tanggal: { gte: dayStart, lte: dayEnd } },
        createdAt: { lt: antrean.createdAt },
      },
    });

    const totalQueue = await this.prisma.antrean.count({
      where: {
        poliId: antrean.poliId,
        status: { in: ['WAITING', 'CALLED'] },
        appointment: { tanggal: { gte: dayStart, lte: dayEnd } },
      },
    });

    const inService = await this.prisma.antrean.findFirst({
      where: { poliId: antrean.poliId, status: 'IN_SERVICE' },
      orderBy: { updatedAt: 'desc' },
    });

    const estWait = antrean.poli ? queueAhead * antrean.poli.estWait : 0;

    return {
      antrean,
      queueAhead,
      totalQueue,
      position: queueAhead + 1,
      currentServing: inService?.nomor ?? null,
      estWaitMin: estWait,
      estWaitLabel: estWait > 0 ? `~${estWait} Menit` : '< 1 Menit',
    };
  }

  async findOne(id: string) {
    return this.prisma.antrean.findUnique({
      where: { id },
      include: { poli: true, user: true, appointment: true },
    });
  }

  async findAll(poliId?: string) {
    const where: Prisma.AntreanWhereInput = { status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } };
    if (poliId) where.poliId = poliId;

    return this.prisma.antrean.findMany({
      where,
      include: { poli: true, user: true, appointment: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getStatus(poliId: string, antreanId?: string) {
    const inService = await this.prisma.antrean.findFirst({
      where: { poliId, status: 'IN_SERVICE' },
      orderBy: { updatedAt: 'desc' },
    });

    const displayNomor = inService?.nomor || '-';

    let estimasiMenit = 0;
    if (antreanId) {
      const antrean = await this.prisma.antrean.findUnique({
        where: { id: antreanId },
        include: { poli: true, appointment: true },
      });
      if (antrean && antrean.poli) {
        const apptTanggal = antrean.appointment?.tanggal;
        const dayStart = apptTanggal ? new Date(apptTanggal) : new Date();
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = apptTanggal ? new Date(apptTanggal) : new Date();
        dayEnd.setHours(23, 59, 59, 999);

        const countAhead = await this.prisma.antrean.count({
          where: {
            poliId,
            status: { in: ['WAITING', 'CALLED'] },
            appointment: { tanggal: { gte: dayStart, lte: dayEnd } },
            createdAt: { lt: antrean.createdAt },
          },
        });
        estimasiMenit = countAhead * antrean.poli.estWait;
      }
    }

    return {
      sedangDilayani: displayNomor,
      estimasi: estimasiMenit > 0 ? `${estimasiMenit} Menit` : '< 1 Menit',
    };
  }

  async updateStatus(id: string, status: AntreanStatus) {
    const antrean = await this.prisma.antrean.findUnique({
      where: { id },
      include: { poli: true, user: true, appointment: true },
    });
    if (!antrean) throw new NotFoundException('Antrean tidak ditemukan');

    const timestampData: Record<string, { calledAt?: Date; serviceStartedAt?: Date; completedAt?: Date; cancelledAt?: Date }> = {
      CALLED: { calledAt: new Date() },
      IN_SERVICE: { serviceStartedAt: new Date() },
      COMPLETED: { completedAt: new Date() },
      CANCELLED: { cancelledAt: new Date() },
      NO_SHOW: { cancelledAt: new Date() },
    };

    const updated = await this.prisma.antrean.update({
      where: { id },
      data: {
        status,
        ...(timestampData[status] || {}),
      },
      include: { poli: true, user: true, appointment: true },
    });

    if (antrean.appointment) {
      const apptStatus: Record<string, AppointmentStatus | undefined> = {
        COMPLETED: AppointmentStatus.COMPLETED,
        IN_SERVICE: AppointmentStatus.IN_PROGRESS,
      };
      const mappedApptStatus = apptStatus[status];
      if (mappedApptStatus) {
        await this.prisma.appointment.update({
          where: { id: antrean.appointment.id },
          data: { status: mappedApptStatus },
        });
      }
    }

    const notifMap: Record<string, { title: string; description: string; icon: string; iconBg: string; categoryColor: string } | null> = {
      CALLED: { title: 'Anda Dipanggil', description: `Silakan menuju ${updated.poli?.name || 'Poli'}`, icon: 'megaphone-outline', iconBg: '#e0f2fe', categoryColor: '#0891b2' },
      IN_SERVICE: { title: 'Sedang Dilayani', description: `Anda sedang dilayani di ${updated.poli?.name || 'Poli'}`, icon: 'medkit-outline', iconBg: '#ccfbf1', categoryColor: '#0d9488' },
      COMPLETED: { title: 'Pelayanan Selesai', description: `Pelayanan di ${updated.poli?.name || 'Poli'} telah selesai`, icon: 'checkmark-circle-outline', iconBg: '#dcfce7', categoryColor: '#166534' },
    };

    const notif = notifMap[status];
    if (notif) {
      const created = await this.prisma.notification.create({
        data: {
          userId: updated.userId,
          type: 'antrean',
          category: 'Antrean',
          categoryColor: notif.categoryColor,
          title: notif.title,
          description: notif.description,
          icon: notif.icon,
          iconBg: notif.iconBg,
          accentBorder: true,
        },
      });
      this.ws.emitToUser(updated.userId, 'notification:new', created);
    }

    this.ws.emitToUser(updated.userId, 'antrean:updated', updated);
    this.ws.emitToPoliRoom(updated.poliId, 'queue:updated', {
      poliId: updated.poliId,
      antreanId: updated.id,
      status: updated.status,
    });

    return updated;
  }
}

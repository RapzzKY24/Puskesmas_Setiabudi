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

  async autoExpire() {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now);
    dayEnd.setHours(23, 59, 59, 999);

    const waiting = await this.prisma.antrean.findMany({
      where: {
        status: { in: ['WAITING', 'CALLED'] },
        appointment: { tanggal: { lte: dayEnd } },
      },
      include: { poli: true },
    });

    const JAM_BUKA = 8;
    const expiredIds: string[] = [];

    for (const antrean of waiting) {
      const nomorUrut = parseInt(antrean.nomor.split('-').pop() || '0', 10);
      if (nomorUrut === 0) continue;

      const estWait = antrean.poli?.estWait ?? 15;
      const createdMin = antrean.createdAt.getHours() * 60 + antrean.createdAt.getMinutes();
      const baseMin = Math.max(createdMin, JAM_BUKA * 60);
      const estimasiMenit = baseMin + nomorUrut * estWait + estWait;
      const estimasiJam = Math.floor(estimasiMenit / 60);
      const estimasiMenitSisa = estimasiMenit % 60;

      const estimasiTime = new Date(dayStart);
      estimasiTime.setHours(estimasiJam, estimasiMenitSisa, 0, 0);

      if (now > estimasiTime) {
        expiredIds.push(antrean.id);
      }
    }

    if (expiredIds.length > 0) {
      const expiredAntreans = await this.prisma.antrean.findMany({
        where: { id: { in: expiredIds } },
        select: { id: true, appointmentId: true },
      });

      const apptIds = expiredAntreans
        .map((a) => a.appointmentId)
        .filter((id): id is string => id !== null);

      await this.prisma.antrean.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: 'NO_SHOW', cancelledAt: now },
      });

      if (apptIds.length > 0) {
        await this.prisma.appointment.updateMany({
          where: { id: { in: apptIds } },
          data: { status: 'CANCELLED' },
        });
      }
    }
  }

  async getActive(userId: string) {
    await this.autoExpire();
    return this.prisma.antrean.findFirst({
      where: { userId, status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } },
      include: { poli: true, appointment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyQueueInfo(userId: string) {
    await this.autoExpire();
    const antrean = await this.prisma.antrean.findFirst({
      where: { userId, status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } },
      include: { poli: true, appointment: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!antrean) {
      return { antrean: null, queueAhead: 0, totalQueue: 0, position: 0, currentServing: null, estWaitMin: 0, estWaitLabel: '-' };
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

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const JAM_BUKA = 8;
    const baseMin = Math.max(nowMin, JAM_BUKA * 60);
    const estFromNow = queueAhead * (antrean.poli?.estWait ?? 15);
    const totalMenit = baseMin + estFromNow;
    const jam = Math.floor(totalMenit / 60) % 24;
    const menit = totalMenit % 60;
    const jamStr = `${String(jam).padStart(2, '0')}.${String(menit).padStart(2, '0')}`;

    return {
      antrean,
      queueAhead,
      totalQueue,
      position: queueAhead + 1,
      currentServing: inService?.nomor ?? null,
      estWaitMin: estFromNow,
      estWaitLabel: `Estimasi dilayani pukul ${jamStr} WIB`,
    };
  }

  async findOne(id: string) {
    return this.prisma.antrean.findUnique({
      where: { id },
      include: { poli: true, user: true, appointment: true },
    });
  }

  async findAll(poliId?: string) {
    await this.autoExpire();
    const where: Prisma.AntreanWhereInput = { status: { in: ['WAITING', 'CALLED', 'IN_SERVICE'] } };
    if (poliId) where.poliId = poliId;

    return this.prisma.antrean.findMany({
      where,
      include: { poli: true, user: true, appointment: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getStatus(poliId: string, antreanId?: string) {
    await this.autoExpire();
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
        const position = countAhead + 1;
        const totalMenit = position * antrean.poli.estWait;
        const JAM_BUKA = 8;
        const jam = JAM_BUKA + Math.floor(totalMenit / 60);
        const menit = totalMenit % 60;
        estimasiMenit = totalMenit;
      }
    }

    return {
      sedangDilayani: displayNomor,
      estimasi: `Estimasi dilayani pukul ${String(8 + Math.floor(estimasiMenit / 60)).padStart(2, '0')}.${String(estimasiMenit % 60).padStart(2, '0')} WIB`,
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

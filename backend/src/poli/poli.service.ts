import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoliRequestDto } from './dto/create-poli-request.dto';
import { UpdatePoliRequestDto } from './dto/update-poli-request.dto';
import { AntreanService } from '../antrean/antrean.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PoliService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly antreanService: AntreanService,
  ) {}

  async findAll(includeInactive = false, tanggal?: string) {
    await this.antreanService.autoExpire();
    const polis = await this.prisma.poli.findMany({
      where: includeInactive ? {} : { active: true },
    });

    const date = tanggal ? new Date(tanggal) : new Date();
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const antreans = await this.prisma.antrean.findMany({
      where: {
        status: { in: ['WAITING', 'CALLED'] },
        appointment: {
          tanggal: { gte: dayStart, lte: dayEnd },
        },
      },
      select: { poliId: true },
    });

    const countMap = new Map<string, number>();
    for (const a of antreans) {
      countMap.set(a.poliId, (countMap.get(a.poliId) ?? 0) + 1);
    }

    return polis.map((p) => ({
      ...p,
      queueCount: countMap.get(p.id) ?? 0,
    }));
  }

  async findOne(id: string) {
    const poli = await this.prisma.poli.findUnique({ where: { id } });
    if (!poli) throw new NotFoundException('Poli tidak ditemukan');
    return poli;
  }

  async create(data: CreatePoliRequestDto) {
    try {
      return await this.prisma.poli.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Kode poli sudah digunakan');
      }
      throw error;
    }
  }

  async update(id: string, data: UpdatePoliRequestDto) {
    const existing = await this.prisma.poli.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Poli tidak ditemukan');

    try {
      return await this.prisma.poli.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Kode poli sudah digunakan');
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.poli.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Poli tidak ditemukan');

    return this.prisma.poli.update({ where: { id }, data: { active: false } });
  }
}

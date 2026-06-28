import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePoliRequestDto } from './dto/create-poli-request.dto';
import { UpdatePoliRequestDto } from './dto/update-poli-request.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PoliService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    const polis = await this.prisma.poli.findMany({
      where: includeInactive ? {} : { active: true },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const counts = await this.prisma.antrean.groupBy({
      by: ['poliId'],
      where: {
        status: { in: ['WAITING', 'CALLED'] },
        createdAt: { gte: todayStart },
      },
      _count: { id: true },
    });

    const countMap = new Map(counts.map((c) => [c.poliId, c._count.id]));

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

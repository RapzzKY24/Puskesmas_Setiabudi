import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promo.findMany();
  }
}

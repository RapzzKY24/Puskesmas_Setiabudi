import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  async updateProfile(userId: string, data: UpdateProfileRequestDto) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('User tidak ditemukan');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    const { password, ...rest } = user;
    return rest;
  }
}

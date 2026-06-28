import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { RegisterRequestDto } from './dto/register-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(identifier: string, password: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { nik: identifier },
          { noHp: identifier },
          { email: identifier },
        ],
      },
    });

    if (!user) throw new UnauthorizedException('Akun tidak ditemukan');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Password salah');

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return { token, user: this.sanitize(user) };
  }

  async register(data: RegisterRequestDto): Promise<MessageResponseDto> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { nik: data.identifier },
          { noHp: data.identifier },
          { email: data.identifier },
        ],
      },
    });

    if (existing) throw new ConflictException('Akun sudah terdaftar');

    const hashed = await bcrypt.hash(data.password, 12);
    const isNIK = /^\d{16}$/.test(data.identifier);

    await this.prisma.user.create({
      data: {
        ...(isNIK ? { nik: data.identifier } : { noHp: data.identifier }),
        nama: data.nama || '',
        password: hashed,
      },
    });

    return { message: 'Registrasi berhasil. Silakan verifikasi OTP.' };
  }

  async verifyOtp(code: string): Promise<AuthResponseDto | MessageResponseDto> {
    return { token: '', user: null } as unknown as AuthResponseDto;
  }

  async resendOtp(identifier: string): Promise<MessageResponseDto> {
    return { message: 'Kode OTP telah dikirim ulang' };
  }

  private sanitize(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}

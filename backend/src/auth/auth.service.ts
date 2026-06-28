import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { RegisterRequestDto } from './dto/register-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';

interface OtpEntry {
  code: string;
  expiry: Date;
}

@Injectable()
export class AuthService {
  private otpStore = new Map<string, OtpEntry>();

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

    if (!isNIK) {
      const otp = this.generateOtp(data.identifier);
      return { message: `Kode OTP: ${otp}. Silakan verifikasi.`, otp };
    }

    return { message: 'Registrasi berhasil. Silakan verifikasi OTP.' };
  }

  async verifyOtp(identifier: string, code: string, nama?: string): Promise<AuthResponseDto> {
    if (!this.validateOtp(identifier, code)) {
      throw new UnauthorizedException('Kode OTP salah atau telah kedaluwarsa');
    }
    this.otpStore.delete(identifier);

    let user = await this.prisma.user.findFirst({
      where: { noHp: identifier },
    });

    if (!user && nama) {
      user = await this.prisma.user.create({
        data: {
          noHp: identifier,
          nama,
          password: '',
        },
      });
    }

    if (!user) throw new UnauthorizedException('Akun tidak ditemukan');

    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return { token, user: this.sanitize(user) };
  }

  async resendOtp(identifier: string): Promise<MessageResponseDto> {
    const otp = this.generateOtp(identifier);
    return { message: `Kode OTP telah dikirim ulang: ${otp}`, otp };
  }

  private generateOtp(identifier: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(identifier, {
      code,
      expiry: new Date(Date.now() + 5 * 60 * 1000),
    });
    return code;
  }

  private validateOtp(identifier: string, code: string): boolean {
    const entry = this.otpStore.get(identifier);
    if (!entry) return false;
    if (Date.now() > entry.expiry.getTime()) {
      this.otpStore.delete(identifier);
      return false;
    }
    return entry.code === code;
  }

  private sanitize(user: User) {
    const { password, ...rest } = user;
    return rest;
  }
}

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { VerifyOtpRequestDto } from './dto/verify-otp-request.dto';
import { ResendOtpRequestDto } from './dto/resend-otp-request.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginRequestDto) {
    return this.auth.login(body.identifier, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterRequestDto) {
    return this.auth.register(body);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() body: VerifyOtpRequestDto) {
    return this.auth.verifyOtp(body.code);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  resendOtp(@Body() body: ResendOtpRequestDto) {
    return this.auth.resendOtp(body.identifier);
  }
}

import { IsString, MinLength } from 'class-validator';

export class VerifyOtpRequestDto {
  @IsString()
  @MinLength(1)
  code: string;
}

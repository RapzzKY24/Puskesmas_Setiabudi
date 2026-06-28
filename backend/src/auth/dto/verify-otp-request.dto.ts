import { IsString, MinLength, IsOptional } from 'class-validator';

export class VerifyOtpRequestDto {
  @IsString()
  @MinLength(1)
  identifier: string;

  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @IsOptional()
  nama?: string;
}

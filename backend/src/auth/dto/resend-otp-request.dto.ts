import { IsString, MinLength } from 'class-validator';

export class ResendOtpRequestDto {
  @IsString()
  @MinLength(1)
  identifier: string;
}

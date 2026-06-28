import { IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  @MinLength(1)
  identifier: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  nama?: string;
}

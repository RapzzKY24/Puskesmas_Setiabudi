import { IsString, IsOptional, MinLength, IsEmail } from 'class-validator';

export class UpdateProfileRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  nama?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  noHp?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

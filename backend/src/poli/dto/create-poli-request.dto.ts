import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

export class CreatePoliRequestDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  icon: string;

  @IsString()
  @MinLength(1)
  iconBg: string;

  @IsString()
  @MinLength(1)
  desc: string;

  @IsString()
  @IsOptional()
  lokasi?: string;

  @IsNumber()
  @Min(1)
  estWait: number;
}

import { IsString, IsNumber, IsBoolean, IsOptional, Min, MinLength } from 'class-validator';

export class UpdatePoliRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  icon?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  iconBg?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  desc?: string;

  @IsString()
  @IsOptional()
  lokasi?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  estWait?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateObatDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  rule: string;
}

export class CreateEResumeRequestDto {
  @IsString()
  @IsUUID()
  appointmentId: string;

  @IsString()
  @IsOptional()
  diagnosa?: string;

  @IsString()
  @IsOptional()
  deskripsi?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateObatDto)
  obat?: CreateObatDto[];
}

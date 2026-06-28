import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateAppointmentRequestDto {
  @IsString()
  @IsUUID()
  poliId: string;

  @IsString()
  @MinLength(1)
  tanggal: string;

  @IsString()
  @MinLength(1)
  keluhan: string;
}

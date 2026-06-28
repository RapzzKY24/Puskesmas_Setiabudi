import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentStatusRequestDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

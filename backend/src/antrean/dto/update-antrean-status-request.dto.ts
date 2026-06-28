import { IsEnum } from 'class-validator';
import { AntreanStatus } from '@prisma/client';

export class UpdateAntreanStatusRequestDto {
  @IsEnum(AntreanStatus)
  status: AntreanStatus;
}

import { AppointmentStatusType } from '../../common/types/prisma.types';

export class HistoryItemDto {
  id: string;
  poliName: string;
  date: string;
  time: string;
  status: AppointmentStatusType;
}

export class HistoryResponseDto {
  items: HistoryItemDto[];
}

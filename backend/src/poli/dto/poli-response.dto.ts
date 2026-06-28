export class PoliResponseDto {
  id: string;
  code: string;
  name: string;
  icon: string;
  iconBg: string;
  desc: string;
  lokasi: string | null;
  estWait: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  queueCount?: number;
}

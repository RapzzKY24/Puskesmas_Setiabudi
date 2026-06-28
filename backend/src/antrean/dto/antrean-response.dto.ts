export class AntreanResponseDto {
  id: string;
  userId: string;
  poliId: string;
  appointmentId: string | null;
  nomor: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  poli?: { id: string; name: string; code: string; estWait: number };
  user?: { id: string; nama: string | null; noHp: string | null };
  appointment?: { id: string; status: string; keluhan: string } | null;
}

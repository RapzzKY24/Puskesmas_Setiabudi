export class ObatItemDto {
  name: string;
  rule: string;
}

export class AppointmentResponseDto {
  id: string;
  userId: string;
  poliId: string;
  tanggal: Date;
  keluhan: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  poli?: { id: string; name: string; code: string };
  user?: { id: string; nama: string | null; noHp: string | null };
  antrean?: { id: string; nomor: string; status: string } | null;
  eResume?: {
    id: string;
    diagnosa: string | null;
    deskripsi: string | null;
    obat: ObatItemDto[];
  } | null;
}

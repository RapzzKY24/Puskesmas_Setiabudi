export class EResumeResponseDto {
  id: string;
  appointmentId: string;
  userId: string;
  diagnosa: string | null;
  deskripsi: string | null;
  createdAt: Date;
  updatedAt: Date;
  obat: { name: string; rule: string }[];
  appointment?: { id: string; poli: { name: string } };
}

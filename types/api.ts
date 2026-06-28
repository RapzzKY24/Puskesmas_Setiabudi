export interface User {
  id: string;
  nik?: string | null;
  nama?: string | null;
  noHp?: string | null;
  email?: string | null;
  role: 'PATIENT' | 'ADMIN' | 'DOCTOR';
  createdAt: string;
  updatedAt: string;
}

export interface Poli {
  id: string;
  code: string;
  name: string;
  icon: string;
  iconBg: string;
  desc: string;
  lokasi?: string | null;
  estWait: number;
  active: boolean;
  queueCount?: number;
}

export interface Appointment {
  id: string;
  userId: string;
  poliId: string;
  tanggal: string;
  keluhan: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  poli?: Poli;
  antrean?: Antrean | null;
}

export interface QueueInfo {
  antrean: Antrean | null;
  queueAhead: number;
  totalQueue: number;
  position: number;
  currentServing: string | null;
  estWaitMin: number;
  estWaitLabel: string;
}

export interface Antrean {
  id: string;
  userId: string;
  poliId: string;
  appointmentId?: string | null;
  nomor: string;
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'NO_SHOW';
  poli?: Poli;
  appointment?: Appointment | null;
}

export interface EResume {
  id: string;
  appointmentId: string;
  userId: string;
  diagnosa?: string | null;
  deskripsi?: string | null;
  appointment?: Appointment;
  obat: ResepObat[];
}

export interface ResepObat {
  id: string;
  eResumeId: string;
  name: string;
  rule: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  category: string;
  categoryColor: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  accentBorder: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  poliName: string;
  date: string;
  time: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface Promo {
  id: string;
  title: string;
  desc: string;
  badge: string;
  icon: string;
  color1: string;
  color2: string;
}

export interface AvailableDate {
  dayName: string;
  date: number;
  month: string;
  full: string;
}

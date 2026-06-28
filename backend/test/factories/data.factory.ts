export function mockUser(overrides?: Record<string, unknown>) {
  return {
    id: 'user-1',
    nik: '1234567890123456',
    nama: 'John Doe',
    noHp: '08123456789',
    email: null,
    password: '$2a$12$hashedpassword',
    role: 'PATIENT',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function mockPoli(overrides?: Record<string, unknown>) {
  return {
    id: 'poli-1',
    code: 'UMUM',
    name: 'Poli Umum',
    icon: 'medkit-outline',
    iconBg: '#e0f2fe',
    desc: 'Layanan umum',
    lokasi: 'Lantai 1',
    estWait: 30,
    active: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

export function mockAppointment(overrides?: Record<string, unknown>) {
  return {
    id: 'appt-1',
    userId: 'user-1',
    poliId: 'poli-1',
    tanggal: new Date('2026-06-28'),
    keluhan: 'Demam dan batuk',
    status: 'WAITING',
    createdAt: new Date('2026-06-28T08:00:00Z'),
    updatedAt: new Date('2026-06-28T08:00:00Z'),
    poli: mockPoli(),
    ...overrides,
  };
}

export function mockAntrean(overrides?: Record<string, unknown>) {
  return {
    id: 'antrean-1',
    userId: 'user-1',
    poliId: 'poli-1',
    appointmentId: 'appt-1',
    nomor: 'UMUM-001',
    status: 'WAITING',
    calledAt: null,
    serviceStartedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: new Date('2026-06-28T08:00:00Z'),
    updatedAt: new Date('2026-06-28T08:00:00Z'),
    poli: mockPoli(),
    user: mockUser(),
    appointment: mockAppointment(),
    ...overrides,
  };
}

export function mockNotification(overrides?: Record<string, unknown>) {
  return {
    id: 'notif-1',
    userId: 'user-1',
    type: 'antrean',
    category: 'Antrean',
    categoryColor: '#0891b2',
    title: 'Anda Dipanggil',
    description: 'Silakan menuju Poli Umum',
    icon: 'megaphone-outline',
    iconBg: '#e0f2fe',
    accentBorder: true,
    readAt: null,
    createdAt: new Date('2026-06-28T08:00:00Z'),
    ...overrides,
  };
}

export function mockPromo(overrides?: Record<string, unknown>) {
  return {
    id: 'promo-1',
    title: 'Promo Sehat',
    desc: 'Diskon 50%',
    badge: 'Terbatas',
    icon: 'heart',
    color1: '#ccfbf1',
    color2: '#f0fdfa',
    ...overrides,
  };
}

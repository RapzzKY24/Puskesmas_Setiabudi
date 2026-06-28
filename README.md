# Puskemas

Sistem antrian Puskesmas berbasis mobile — daftar, booking poli, dan pantau antrean secara real-time.

## Fitur

| Fitur | Deskripsi |
|---|---|
| **Splash Screen** | Animasi loading dengan logo Puskesmas |
| **Login** | Via NIK (16 digit) atau nomor HP + kata sandi |
| **Registrasi** | Daftar via NIK atau HP, verifikasi OTP |
| **Dashboard** | Hero banner, promo carousel, status antrean aktif |
| **Reservasi Poli** | Pilih poli + tanggal + keluhan, konfirmasi antrean |
| **Antrean Live** | Nomor antrean real-time via WebSocket, estimasi waktu |
| **Riwayat** | Daftar kunjungan dengan status (selesai/batal/menunggu) |
| **E-Resume** | Resume medis elektronik (diagnosa, resep obat) |
| **Notifikasi** | Grup hari ini/kemarin dengan kategori |
| **Admin Panel** | Kelola antrean (panggil/layani/selesai) + CRUD poli |

## Tech Stack

```
Frontend:   Expo SDK 54 · React Native 0.81 · React 19
            Expo Router 6 · React Navigation 7
            Zustand · React Hook Form · Zod
            Reanimated 4 · Axios · expo-image

Backend:    NestJS 11 · TypeScript 5.7
            Prisma 7.8 (PostgreSQL) · Passport JWT
            WebSocket (ws) · class-validator

Database:   PostgreSQL 16 (Docker)
```

## Struktur Proyek

```
puskemas/
├── app/                       # Expo Router (file-based routing)
│   ├── _layout.tsx            # Root stack navigator
│   ├── index.tsx              # Splash → /login
│   ├── login.tsx
│   ├── register.tsx
│   ├── otp.tsx
│   ├── appointment.tsx
│   ├── antrean.tsx
│   ├── modal.tsx
│   ├── (app)/                 # Authenticated routes (stack)
│   │   ├── index.tsx          # Dashboard
│   │   ├── antrean.tsx        # Reservasi poli
│   │   ├── history.tsx
│   │   ├── admin.tsx
│   │   ├── e-resume.tsx
│   │   ├── notifications.tsx
│   │   ├── ticket-detail.tsx
│   │   └── profile.tsx
│   └── (tabs)/                # Tab navigator (starter template)
│
├── screens/                   # Screen components
├── components/
│   ├── navigation/            # BottomNav
│   ├── modals/                # ConfirmModal
│   └── ui/                    # IconSymbol, Collapsible, ThemedText, dll
├── hooks/                     # useColorScheme, useThemeColor
├── lib/                       # api, auth-store, websocket-client
├── constants/                 # theme.ts (Colors + Fonts)
└── types/                     # api.ts

backend/
├── src/
│   ├── auth/                  # Login, register, OTP, JWT strategy
│   ├── users/                 # Profile
│   ├── poli/                  # CRUD poli
│   ├── appointments/          # Booking janji temu
│   ├── antrean/               # Manajemen antrean
│   ├── e-resume/              # Resume medis
│   ├── history/               # Riwayat kunjungan
│   ├── notifications/         # Notifikasi
│   ├── promos/                # Promo banner
│   ├── prisma/                # PrismaModule + PrismaService
│   ├── websocket/             # WebSocket gateway
│   └── common/                # Guards, decorators, types
├── prisma/
│   ├── schema.prisma          # 3 enum + 8 model
│   └── seed.ts                # Data awal
└── docker-compose.yml         # PostgreSQL 16
```

## Cara Menjalankan

### 1. Backend

```bash
cd backend

# Setup database
docker compose up -d

# Migrate + seed
npx prisma migrate dev
npx prisma db seed

# Jalankan
npm run start:dev        # http://localhost:3000
```

### 2. Frontend

```bash
# Install dependencies (root)
npm install

# Jalankan
npx expo start              # Scan QR dengan Expo Go
npx expo start --android    # Emulator Android
npx expo start --ios        # Simulator iOS
npx expo start --web        # Browser
```

### Environment Variables (backend/.env)

| Variable | Default |
|---|---|
| `DATABASE_URL` | `postgresql://puskemas:puskemas123@localhost:5432/puskemas` |
| `JWT_SECRET` | `puskemas-secret-key-2026` |
| `JWT_EXPIRES_IN` | `7d` |

## API Endpoints

### Auth

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login (NIK/HP + password) |
| POST | `/api/auth/register` | — | Registrasi akun baru |
| POST | `/api/auth/verify-otp` | — | Verifikasi kode OTP |
| POST | `/api/auth/resend-otp` | — | Kirim ulang OTP |

### Poli

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/poli` | — | List poli (`?all=true`, `?tanggal=`) |
| POST | `/api/poli` | ADMIN | Tambah poli |
| PATCH | `/api/poli/:id` | ADMIN | Edit poli |
| DELETE | `/api/poli/:id` | ADMIN | Hapus poli |

### Appointments

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| POST | `/api/appointments` | JWT | Buat janji temu |
| GET | `/api/appointments/available-dates` | JWT | Tanggal tersedia |
| GET | `/api/appointments/:id` | JWT | Detail janji |

### Antrean

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/antrean` | ADMIN | Semua antrean (`?poliId=`) |
| GET | `/api/antrean/me` | JWT | Info antrean saya (posisi, estimasi) |
| GET | `/api/antrean/active` | JWT | Antrean aktif saya |
| PATCH | `/api/antrean/:id/status` | ADMIN | Update status antrean |

### E-Resume, History, Notifications, Promos

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| GET | `/api/e-resume/by-appointment/:id` | JWT | Resume medis per janji |
| POST | `/api/e-resume` | ADMIN | Buat e-resume (diagnosa + resep) |
| GET | `/api/history` | JWT | Riwayat kunjungan |
| GET | `/api/notifications` | JWT | Notifikasi saya |
| PATCH | `/api/notifications/:id/read` | JWT | Tandai sudah dibaca |
| GET | `/api/promos` | — | Promo banner |

### WebSocket

```
ws://localhost:3000/ws?token=<JWT>
Events: join:poli, leave:poli
Server emits: antrean:updated, notification:new, queue:updated
```

## Prisma Schema

```
enum Role                PATIENT | ADMIN | DOCTOR
enum AppointmentStatus   WAITING | IN_PROGRESS | COMPLETED | CANCELLED
enum AntreanStatus       WAITING | CALLED | IN_SERVICE | COMPLETED | CANCELLED | NO_SHOW

User        → Appointment[], Antrean[], EResume[], Notification[]
Poli        → Appointment[], Antrean[]
Appointment → User, Poli, Antrean?, EResume?
Antrean     → User, Poli, Appointment?
EResume     → Appointment, User, ResepObat[]
ResepObat   → EResume
Notification → User
Promo       (standalone)
```

## Akun Default (seed)

| Role | NIK | Password |
|---|---|---|
| PATIENT | 3275010101010001 | password123 |
| ADMIN | (login via HP) | admin123 |

## Scripts

### Frontend

```bash
npm start           # Expo dev server
npm run android     # Android emulator
npm run ios         # iOS simulator
npm run lint        # ESLint
```

### Backend

```bash
npm run start:dev        # Watch mode
npm run test             # Jest
npm run test:cov         # Coverage
npm run prisma:generate  # Regenerate Prisma Client
npm run prisma:migrate   # Migrasi database
npm run prisma:seed      # Seed data awal
```

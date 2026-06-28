import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Seed Poli
  const polis = [
    {
      code: 'umum',
      name: 'Poli Umum',
      icon: 'medical-outline',
      iconBg: '#dcfce7',
      desc: 'Pelayanan kesehatan umum dan konsultasi medis dasar',
      lokasi: 'Gedung A, Lantai 1',
      estWait: 15,
    },
    {
      code: 'gigi',
      name: 'Poli Gigi',
      icon: 'diamond-outline',
      iconBg: '#fce7f3',
      desc: 'Perawatan gigi dan mulut termasuk scaling dan tambalan',
      lokasi: 'Gedung A, Lantai 2',
      estWait: 20,
    },
    {
      code: 'mata',
      name: 'Poli Mata',
      icon: 'eye-outline',
      iconBg: '#dbeafe',
      desc: 'Pemeriksaan mata, koreksi penglihatan, dan konsultasi',
      lokasi: 'Gedung B, Lantai 1',
      estWait: 25,
    },
    {
      code: 'anak',
      name: 'Poli Anak',
      icon: 'happy-outline',
      iconBg: '#fef3c7',
      desc: 'Pelayanan kesehatan untuk bayi, balita, dan anak-anak',
      lokasi: 'Gedung B, Lantai 2',
      estWait: 10,
    },
  ];

  for (const p of polis) {
    await prisma.poli.upsert({
      where: { code: p.code },
      update: p,
      create: p,
    });
  }

  // Seed Promos
  const promos = [
    {
      title: 'Vaksinasi Flu',
      desc: 'Dapatkan vaksinasi flu musiman dengan harga terjangkau',
      badge: 'Available At Setiabudi Puskesmas',
      icon: 'bandage-outline',
      color1: '#0d9488',
      color2: '#0f766e',
    },
    {
      title: 'Cek Kesehatan Gratis',
      desc: 'Pemeriksaan tekanan darah dan gula darah gratis setiap hari Jumat',
      badge: 'Every Friday',
      icon: 'heart-outline',
      color1: '#0891b2',
      color2: '#0e7490',
    },
  ];

  for (const p of promos) {
    await prisma.promo.create({ data: p });
  }

  // Seed Admin user
  const bcrypt = await import('bcryptjs');
  const hashed = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { nik: '0000000000000000' },
    update: {},
    create: {
      nik: '0000000000000000',
      nama: 'Admin Puskesmas',
      password: hashed,
      role: 'ADMIN',
    },
  });

  const patientHashed = await bcrypt.hash('pasien123', 12);

  const patient = await prisma.user.upsert({
    where: { nik: '3273010203040506' },
    update: {},
    create: {
      nik: '3273010203040506',
      nama: 'Budi Santoso',
      noHp: '081234567890',
      password: patientHashed,
      role: 'PATIENT',
    },
  });

  const poliUmum = await prisma.poli.findUnique({ where: { code: 'umum' } });

  if (poliUmum) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const appt = await prisma.appointment.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        userId: patient.id,
        poliId: poliUmum.id,
        tanggal: yesterday,
        keluhan: 'Demam dan batuk sejak 3 hari',
        status: 'COMPLETED',
      },
    });

    await prisma.antrean.upsert({
      where: { id: '00000000-0000-0000-0000-000000000011' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000011',
        userId: patient.id,
        poliId: poliUmum.id,
        appointmentId: appt.id,
        nomor: 'umum-001',
        status: 'COMPLETED',
      },
    });

    await prisma.eResume.upsert({
      where: { id: '00000000-0000-0000-0000-000000000021' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000021',
        appointmentId: appt.id,
        userId: patient.id,
        diagnosa: 'Infeksi Saluran Pernafasan Atas (ISPA)',
        deskripsi: 'Pasien mengalami demam 38°C, batuk produktif, dan pilek. Tidak ada tanda-tanda infeksi berat. Diberikan terapi simptomatik.',
        obat: {
          create: [
            { name: 'Paracetamol 500mg', rule: '3x sehari setelah makan' },
            { name: 'Ambroxol 30mg', rule: '3x sehari' },
            { name: 'CTM 4mg', rule: '2x sehari (malam)' },
          ],
        },
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export function useTicketDetail() {
  const params = useLocalSearchParams<{
    appointmentId?: string;
    poliName?: string;
    date?: string;
    time?: string;
    status?: string;
    keluhan?: string;
    nomorAntrean?: string;
  }>();
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<{
    umum: { nama: string; nik: string; handphone: string };
    kunjungan: { poli: string; keluhan: string; tanggal: string };
    antrean: { nomor: string; dilayani: string; status: string; estimasi: string };
  } | null>(null);

  const hasParams = params.poliName && params.nomorAntrean;

  useEffect(() => {
    if (hasParams) {
      const p = params;
      const u = user;
      setData({
        umum: {
          nama: u?.nama ?? '-',
          nik: u?.nik ?? '-',
          handphone: u?.noHp ?? '-',
        },
        kunjungan: {
          poli: p.poliName ?? '-',
          keluhan: p.keluhan ?? '-',
          tanggal: `${p.date} ${p.time}`,
        },
        antrean: {
          nomor: p.nomorAntrean ?? '-',
          dilayani: '-',
          status: p.status ?? '-',
          estimasi: '-',
        },
      });
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get('/api/antrean/active');
        const a = res.data;
        if (a) {
          setData({
            umum: {
              nama: a.pasien?.nama ?? a.userId ?? '-',
              nik: a.pasien?.nik ?? '-',
              handphone: a.pasien?.handphone ?? '-',
            },
            kunjungan: {
              poli: a.poli?.name ?? a.appointment?.poli?.name ?? '-',
              keluhan: a.appointment?.keluhan ?? '-',
              tanggal: a.appointment?.tanggal ?? '-',
            },
            antrean: {
              nomor: a.nomor ?? '-',
              dilayani: '-',
              status: a.status ?? '-',
              estimasi: '-',
            },
          });
        }
      } catch (err) {
        console.error('Ticket fetch error', err);
      }
    };
    fetchData();
  }, [hasParams]);

  return { data, params, hasParams };
}

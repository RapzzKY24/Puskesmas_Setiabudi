import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ws } from '@/lib/websocket-client';
import { useAuthStore } from '@/lib/auth-store';
import type { Poli, Promo, QueueInfo } from '@/types/api';

export type { Poli, Promo, QueueInfo } from '@/types/api';

export function useDashboard() {
  const user = useAuthStore((s) => s.user);
  const nama = user?.nama ?? 'Lexa';
  const [loading, setLoading] = useState(true);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [, setPoliList] = useState<Poli[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [poliRes, promosRes, queueRes] = await Promise.all([
          api.get<Poli[]>('/api/poli'),
          api.get<Promo[]>('/api/promos'),
          api.get<QueueInfo>('/api/antrean/me'),
        ]);
        setPoliList(poliRes.data);
        setPromos(promosRes.data);
        setQueueInfo(queueRes.data);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    ws.connect();
    const unsub = ws.on('antrean:updated', () => {
      fetchData();
    });
    return () => unsub();
  }, []);

  return { user, nama, loading, queueInfo, promos };
}

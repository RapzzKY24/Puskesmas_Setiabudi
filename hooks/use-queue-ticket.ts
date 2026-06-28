import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ws } from '@/lib/websocket-client';
import { QueueInfo, Antrean } from '@/types/api';

export type { Antrean };

export function useQueueTicket() {
  const [antrean, setAntrean] = useState<QueueInfo['antrean']>(null);
  const [currentServing, setCurrentServing] = useState<string | null>(null);
  const [estWaitLabel, setEstWaitLabel] = useState('---');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<QueueInfo>('/api/antrean/me');
        const data = res.data;
        setAntrean(data.antrean);
        setCurrentServing(data.currentServing);
        setEstWaitLabel(data.estWaitLabel);
      } catch (err) {
        console.error('Queue ticket fetch error', err);
      }
    };
    fetchData();

    ws.connect();
    const unsub = ws.on('antrean:updated', () => {
      fetchData();
    });
    return () => unsub();
  }, []);

  return { antrean, currentServing, estWaitLabel };
}

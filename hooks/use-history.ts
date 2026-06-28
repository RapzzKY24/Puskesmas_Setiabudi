import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export type HistoryItem = {
  id: string;
  poliName: string;
  date: string;
  time: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  keluhan: string;
  nomorAntrean: string;
};

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<HistoryItem[]>('/api/history');
        setItems(res.data);
      } catch (err) {
        console.error('History fetch error', err);
      } finally {
        setLoaded(true);
      }
    };
    fetchData();
  }, []);

  return { items, loaded };
}

import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { Poli } from '@/types/api';
import { DateItem, generateDates, formatDateLabel } from '@/utils/date';

const { width: SCREEN_W } = require('react-native').Dimensions.get('window');
export const DATE_W = (SCREEN_W - 64) / 4.5;

export type PoliData = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  desc: string;
  estWait: string;
  estWaitMin: number;
  queueCount: number;
  active: boolean;
};

export function useReservation() {
  const [dates, setDates] = useState<DateItem[]>(() => generateDates());
  const [selectedDate, setSelectedDate] = useState(dates[0].full);
  const [selectedPoli, setSelectedPoli] = useState('');
  const [poliList, setPoliList] = useState<PoliData[]>([]);
  const router = useRouter();

  const fetchPoli = useCallback(async (date: Date) => {
    try {
      const tanggal = date.toISOString().split('T')[0];
      const res = await api.get<Poli[]>(`/api/poli?tanggal=${tanggal}`);
      setPoliList(
        res.data.map((p) => ({
          id: p.id,
          name: p.name,
          icon: p.icon as keyof typeof Ionicons.glyphMap,
          iconBg: p.iconBg,
          desc: p.desc,
          estWait: `${p.estWait} Menit`,
          estWaitMin: p.estWait,
          queueCount: p.queueCount ?? 0,
          active: p.active,
        })),
      );
    } catch (err) {
      console.error('Fetch poli error', err);
    }
  }, []);

  useEffect(() => {
    fetchPoli(selectedDate);
  }, [selectedDate, fetchPoli]);

  const handlePoliPress = useCallback(
    (poli: PoliData) => {
      const label = formatDateLabel(selectedDate);
      setSelectedPoli(poli.id);
      router.push({
        pathname: '/appointment',
        params: { poliId: poli.id, poliName: poli.name, dateLabel: label, dateISO: selectedDate.toISOString(), queueCount: String(poli.queueCount), estWait: String(poli.estWaitMin) },
      });
    },
    [selectedDate, router],
  );

  return {
    dates,
    selectedDate,
    setSelectedDate,
    selectedPoli,
    poliList,
    handlePoliPress,
  };
}

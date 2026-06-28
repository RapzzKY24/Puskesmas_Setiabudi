import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { isSameDay } from '@/utils/date';

export interface NotificationItem {
  id: string;
  group: 'hari-ini' | 'kemarin';
  type: 'info';
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  category: string;
  categoryColor: string;
  time: string;
  title: string;
  description: string;
  accentBorder?: boolean;
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/notifications');
        const mapped: NotificationItem[] = (res.data ?? []).map(
          (n: any) => {
            const date = new Date(n.createdAt);
            const isToday = isSameDay(date, new Date());
            return {
              id: n.id,
              group: isToday ? 'hari-ini' as const : 'kemarin' as const,
              type: 'info' as const,
              icon: (n.icon || 'notifications-outline') as keyof typeof Ionicons.glyphMap,
              iconBg: n.iconBg,
              category: n.category,
              categoryColor: n.categoryColor,
              time: date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }),
              title: n.title,
              description: n.description,
              accentBorder: n.accentBorder,
            };
          },
        );
        setItems(mapped);
      } catch (err) {
        console.error('Notifications fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayItems = items.filter((n) => n.group === 'hari-ini');
  const yesterdayItems = items.filter((n) => n.group === 'kemarin');

  return { items, todayItems, yesterdayItems, loading };
}

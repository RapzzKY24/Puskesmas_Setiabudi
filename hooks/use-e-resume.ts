import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { EResume } from '@/types/api';

export type { EResume };

export function useEResume() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const [resume, setResume] = useState<EResume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) return;
    api.get<EResume>(`/api/e-resume/by-appointment/${appointmentId}`)
      .then((res) => setResume(res.data))
      .catch(() => setResume(null))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  return { resume, loading };
}

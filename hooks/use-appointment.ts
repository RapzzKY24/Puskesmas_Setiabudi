import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { isClosedToday } from '@/utils/date';

const schema = z.object({
  keluhan: z
    .string()
    .min(1, 'Keluhan wajib diisi')
    .max(500, 'Keluhan maksimal 500 karakter'),
});

type FormData = z.infer<typeof schema>;

export function useAppointment() {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{
    poliId: string;
    poliName: string;
    dateLabel: string;
    dateISO: string;
    queueCount?: string;
    estWait?: string;
  }>();

  const user = useAuthStore((s) => s.user);

  const poliId = params.poliId ?? '';
  const poliName = params.poliName ?? 'Poli Kesehatan Gigi';
  const dateLabel = params.dateLabel ?? 'SELASA, 15 MARET 2026';
  const tanggal = params.dateISO ?? new Date().toISOString();
  const queueCount = Number(params.queueCount ?? 0);
  const estWait = Number(params.estWait ?? 0);

  const isClosed = isClosedToday(new Date(tanggal));

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { keluhan: '' },
  });

  const onSubmit = useCallback(
    (data: FormData) => {
      setShowConfirm(true);
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    setShowConfirm(false);
    const keluhan = getValues('keluhan');
    try {
      await api.post('/api/appointments', {
        poliId,
        tanggal: new Date(tanggal).toISOString(),
        keluhan,
      });
      router.replace('/antrean');
    } catch {
      Alert.alert('Gagal', 'Gagal membuat janji temu. Silakan coba lagi.');
    }
  }, [poliId, tanggal, router, getValues]);

  return {
    showConfirm,
    setShowConfirm,
    user,
    poliId,
    poliName,
    dateLabel,
    queueCount,
    estWait,
    isClosed,
    control,
    errors,
    onSubmit: handleSubmit(onSubmit),
    handleConfirm,
  };
}

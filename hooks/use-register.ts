import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { api } from '@/lib/api';

type RegTab = 'nik' | 'phone';

type RegFormData = {
  identifier: string;
  nama: string | undefined;
  password: string;
  confirmPassword: string;
};

const createRegSchema = (tab: RegTab) =>
  z
    .object({
      identifier: z
        .string()
        .min(1, 'Wajib diisi')
        .refine(
          (val) =>
            tab === 'nik'
              ? /^\d{16}$/.test(val)
              : /^[0-9+\-\s()]{10,15}$/.test(val),
          tab === 'nik' ? 'NIK harus 16 digit angka' : 'Nomor HP tidak valid',
        ),
      nama: tab === 'phone'
        ? z.string().min(1, 'Nama wajib diisi')
        : z.string().optional(),
      password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
      confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Kata sandi tidak cocok',
      path: ['confirmPassword'],
    });

export function useRegister() {
  const [activeTab, setActiveTab] = useState<RegTab>('nik');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const schema = createRegSchema(activeTab);
  const btnScale = useSharedValue(1);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegFormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', nama: '', password: '', confirmPassword: '' },
  });

  const handleTabChange = useCallback(
    (tab: RegTab) => {
      setActiveTab(tab);
      reset(undefined, { keepErrors: false });
    },
    [reset],
  );

  const onSubmit = useCallback(
    async (data: RegFormData) => {
      try {
        const res = await api.post('/api/auth/register', {
          identifier: data.identifier,
          password: data.password,
          ...(data.nama ? { nama: data.nama } : {}),
        });
        if (res.data.otp) {
          console.log('OTP:', res.data.otp);
          alert(`Kode OTP: ${res.data.otp}`);
        }
        router.push({ pathname: '/otp', params: { identifier: data.identifier } });
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Registrasi gagal';
        alert(msg);
      }
    },
    [router],
  );

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return {
    activeTab,
    showPassword,
    showConfirm,
    control,
    errors,
    isSubmitting,
    btnScale,
    btnAnimStyle,
    handleTabChange,
    setShowPassword,
    setShowConfirm,
    onSubmit: handleSubmit(onSubmit),
  };
}

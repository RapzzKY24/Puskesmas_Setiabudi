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
import { useAuthStore } from '@/lib/auth-store';

type LoginTab = 'nik' | 'phone';

type LoginFormData = {
  identifier: string;
  password: string;
};

const createLoginSchema = (tab: LoginTab) =>
  z.object({
    identifier: z
      .string()
      .min(1, 'Wajib diisi')
      .refine(
        (val) =>
          tab === 'nik'
            ? /^\d{16}$/.test(val)
            : /^[0-9+\-\s()]{10,15}$/.test(val),
        tab === 'nik'
          ? 'NIK harus 16 digit angka'
          : 'Nomor HP tidak valid',
      ),
    password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  });

export function useLogin() {
  const [activeTab, setActiveTab] = useState<LoginTab>('nik');
  const [showPassword, setShowPassword] = useState(false);
  const schema = createLoginSchema(activeTab);
  const btnScale = useSharedValue(1);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  });

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  const handleTabChange = useCallback(
    (tab: LoginTab) => {
      setActiveTab(tab);
      reset(undefined, { keepErrors: false });
    },
    [reset],
  );

  const router = useRouter();

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        const res = await api.post('/api/auth/login', data);
        useAuthStore.getState().login(res.data.token, res.data.user);
        router.replace('/(app)');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Login gagal, coba lagi';
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
    control,
    errors,
    isSubmitting,
    btnScale,
    btnAnimStyle,
    handleTabChange,
    togglePassword,
    onSubmit: handleSubmit(onSubmit),
  };
}

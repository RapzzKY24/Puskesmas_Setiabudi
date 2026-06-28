import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const OTP_LENGTH = 6;

export function useOtp() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const btnScale = useSharedValue(1);
  const isComplete = otp.every((d) => d !== '');
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string }>();

  const handleVerify = useCallback(async () => {
    if (!isComplete || loading) return;
    setLoading(true);
    try {
      const code = otp.join('');
      const res = await api.post('/api/auth/verify-otp', {
        identifier: params.identifier,
        code,
      });
      if (res.data.token) {
        useAuthStore.getState().login(res.data.token, res.data.user);
        router.replace('/(app)');
      } else {
        router.replace('/(app)');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Kode OTP salah';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }, [isComplete, otp, loading, router, params.identifier]);

  const handleResend = useCallback(async () => {
    if (!params.identifier) return;
    try {
      const res = await api.post('/api/auth/resend-otp', { identifier: params.identifier });
      alert(res.data.message || 'Kode OTP telah dikirim ulang');
    } catch {
      alert('Gagal mengirim ulang OTP');
    }
  }, [params.identifier]);

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return {
    otp,
    setOtp,
    loading,
    isComplete,
    btnScale,
    btnAnimStyle,
    params,
    handleVerify,
    handleResend,
  };
}

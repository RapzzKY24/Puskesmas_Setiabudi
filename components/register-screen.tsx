import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';

const C = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#14b8a6',
  primaryBg: '#ccfbf1',
  background: '#f1f5f9',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  error: '#dc2626',
  inputBg: '#f8fafc',
} as const;

type RegTab = 'nik' | 'phone';

type RegFormData = {
  identifier: string;
  nama?: string;
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

function LogoHeader() {
  return (
    <View style={s.header}>
      <View style={s.brandRow}>
        <View style={s.shieldWrap}>
          <Ionicons name="shield-checkmark" size={22} color={C.primary} />
        </View>
        <Text style={s.brandText}>Sanctuary</Text>
      </View>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={s.helpText}>Bantuan</Text>
      </TouchableOpacity>
    </View>
  );
}

function RegWelcome() {
  return (
    <View style={s.welcomeSection}>
      <Text style={s.welcomeTitle}>Buat Akun Baru</Text>
      <Text style={s.welcomeSubtitle}>
        Daftar untuk mengakses layanan kesehatan Anda dengan aman.
      </Text>
    </View>
  );
}

interface TabSelectorProps {
  activeTab: RegTab;
  onTabChange: (tab: RegTab) => void;
}

function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const [containerW, setContainerW] = useState(0);
  const tabW = containerW > 0 ? (containerW - 8) / 2 : 0;
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withTiming(activeTab === 'nik' ? 0 : tabW, {
      duration: 250,
    });
  }, [activeTab, tabW, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabW,
  }));

  return (
    <View
      style={s.tabContainer}
      onLayout={(e) => setContainerW(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[s.tabIndicator, indicatorStyle]} />
      <TouchableOpacity
        style={s.tab}
        onPress={() => onTabChange('nik')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            s.tabText,
            activeTab === 'nik' && s.tabTextActive,
            activeTab === 'nik' && { color: '#fff' },
          ]}
        >
          NIK
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.tab}
        onPress={() => onTabChange('phone')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            s.tabText,
            activeTab === 'phone' && s.tabTextActive,
            activeTab === 'phone' && { color: '#fff' },
          ]}
        >
          Nomor HP
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function RegisterScreen() {
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

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LogoHeader />
          <RegWelcome />

          <View style={s.card}>
            <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />

            <View style={s.fieldGroup}>
              <Text style={s.label}>
                {activeTab === 'nik'
                  ? 'Nomor Induk Kependudukan (NIK)'
                  : 'Nomor Handphone'}
              </Text>
              <View style={[s.inputWrap, errors.identifier && s.inputError]}>
                <Ionicons
                  name={activeTab === 'nik' ? 'card-outline' : 'call-outline'}
                  size={20}
                  color={C.textMuted}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="identifier"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={s.input}
                      placeholder={
                        activeTab === 'nik' ? '3275xxxxxxxxxxxx' : '08xxxxxxxxxx'
                      }
                      placeholderTextColor={C.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="number-pad"
                      maxLength={activeTab === 'nik' ? 16 : 15}
                      autoCapitalize="none"
                    />
                  )}
                />
              </View>
              {errors.identifier && (
                <Text style={s.errorText}>{errors.identifier.message}</Text>
              )}
              {activeTab === 'nik' && !errors.identifier && (
                <Text style={s.helperText}>
                  Pastikan 16 digit NIK Anda sesuai dengan KTP
                </Text>
              )}
            </View>

            {activeTab === 'phone' && (
              <View style={s.fieldGroup}>
                <Text style={s.label}>Nama Lengkap</Text>
                <View style={[s.inputWrap, errors.nama && s.inputError]}>
                  <Ionicons name="person-outline" size={20} color={C.textMuted} style={s.inputIcon} />
                  <Controller
                    control={control}
                    name="nama"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={s.input}
                        placeholder="Budi Santoso"
                        placeholderTextColor={C.textMuted}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="words"
                      />
                    )}
                  />
                </View>
                {errors.nama && (
                  <Text style={s.errorText}>{errors.nama.message}</Text>
                )}
              </View>
            )}

            <View style={s.fieldGroup}>
              <Text style={s.label}>Kata Sandi</Text>
              <View style={[s.inputWrap, errors.password && s.inputError]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={C.textMuted}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={s.input}
                      placeholder="Minimal 6 karakter"
                      placeholderTextColor={C.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={s.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={s.errorText}>{errors.password.message}</Text>
              )}
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>Konfirmasi Kata Sandi</Text>
              <View
                style={[s.inputWrap, errors.confirmPassword && s.inputError]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={C.textMuted}
                  style={s.inputIcon}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={s.input}
                      placeholder="Ulangi kata sandi"
                      placeholderTextColor={C.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry={!showConfirm}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm((p) => !p)}
                  style={s.eyeBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={s.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>

            <Animated.View style={btnAnimStyle}>
              <TouchableOpacity
                style={[s.submitBtn, isSubmitting && s.submitDisabled]}
                onPress={handleSubmit(onSubmit)}
                onPressIn={() => (btnScale.value = withSpring(0.97))}
                onPressOut={() => (btnScale.value = withSpring(1))}
                activeOpacity={0.85}
                disabled={isSubmitting}
              >
                <Text style={s.submitText}>Daftar</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={s.footerRow}>
            <Text style={s.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/')}
            >
              <Text style={s.footerLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shieldWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
  },
  helpText: { fontSize: 14, fontWeight: '500', color: C.primary },

  welcomeSection: { marginTop: 20, marginBottom: 28 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: C.textSecondary,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.inputBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    backgroundColor: C.primary,
    borderRadius: 10,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: C.textSecondary },
  tabTextActive: { fontWeight: '700' },

  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: { borderColor: C.error },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: C.text, height: '100%' },
  eyeBtn: { padding: 4, marginLeft: 8 },
  helperText: {
    fontSize: 12,
    color: C.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  errorText: { fontSize: 12, color: C.error, marginTop: 6 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    gap: 8,
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: { fontSize: 14, color: C.textSecondary },
  footerLink: { fontSize: 14, fontWeight: '700', color: C.primary },
});

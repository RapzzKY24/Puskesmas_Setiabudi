import React, { useCallback, useRef, useEffect, useState } from 'react';
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
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useOtp } from '@/hooks/use-otp';

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

const OTP_LENGTH = 6;

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

function OtpHeader() {
  return (
    <View style={s.welcomeSection}>
      <Text style={s.welcomeTitle}>Verifikasi Nomor</Text>
      <Text style={s.welcomeSubtitle}>
        Kode akan dikirimkan ke nomor +6289xxxxxxxx
      </Text>
    </View>
  );
}

function OtpInput({ code, onChangeCode, onFilled }: { code: string[]; onChangeCode: (code: string[]) => void; onFilled: () => void }) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIdx, setFocusedIdx] = useState<number>(0);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (code.every((d) => d !== '')) {
      onFilled();
    }
  }, [code, onFilled]);

  const handleChange = useCallback(
    (text: string, idx: number) => {
      const digit = text.replace(/[^0-9]/g, '');
      if (digit.length > 1) return;

      const next = [...code];
      next[idx] = digit;
      onChangeCode(next);

      if (digit && idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [code, onChangeCode],
  );

  const handleKeyPress = useCallback(
    (key: string, idx: number) => {
      if (key === 'Backspace' && !code[idx] && idx > 0) {
        const next = [...code];
        next[idx - 1] = '';
        onChangeCode(next);
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [code, onChangeCode],
  );

  return (
    <View style={s.otpRow}>
      {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
        <OtpBox
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          value={code[idx]}
          isFocused={focusedIdx === idx}
          onFocus={() => setFocusedIdx(idx)}
          onChangeText={(t) => handleChange(t, idx)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, idx)}
        />
      ))}
    </View>
  );
}

function OtpBox({ value, isFocused, onFocus, onChangeText, onKeyPress }: {
  value: string;
  isFocused: boolean;
  onFocus: () => void;
  onChangeText: (text: string) => void;
  onKeyPress: (e: { nativeEvent: { key: string } }) => void;
}) {
  const scale = useSharedValue(1);
  const borderColor = useSharedValue(0);

  useEffect(() => {
    if (value) {
      scale.value = withSequence(withSpring(1.08), withSpring(1));
      borderColor.value = withTiming(1, { duration: 200 });
    } else if (!isFocused) {
      borderColor.value = withTiming(0, { duration: 200 });
    }
  }, [value, isFocused, scale, borderColor]);

  useEffect(() => {
    if (isFocused) {
      borderColor.value = withTiming(1, { duration: 200 });
    } else if (!value) {
      borderColor.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused, value, borderColor]);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor:
      borderColor.value > 0 ? C.primary : C.border,
  }));

  return (
    <Animated.View style={[s.otpBox, boxStyle]}>
      <TextInput
        ref={(ref) => { /* handled by parent */ }}
        style={s.otpInput}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        onFocus={onFocus}
        keyboardType="number-pad"
        maxLength={1}
        selectionColor={C.primary}
        caretHidden={false}
      />
    </Animated.View>
  );
}

function ResendSection({ onResend }: { onResend: () => void }) {
  return (
    <View style={s.resendSection}>
      <Text style={s.resendText}>Tidak Mendapatkan Kode ?</Text>
      <TouchableOpacity activeOpacity={0.7} onPress={onResend}>
        <Text style={s.resendLink}>Kirim Ulang</Text>
      </TouchableOpacity>
    </View>
  );
}

export function OtpScreen() {
  const {
    otp,
    setOtp,
    loading,
    isComplete,
    btnScale,
    btnAnimStyle,
    handleVerify,
    handleResend,
  } = useOtp();

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
          <OtpHeader />

          <Animated.View
            entering={FadeInUp.duration(400).springify()}
            style={s.card}
          >
            <OtpInput
              code={otp}
              onChangeCode={setOtp}
              onFilled={() => {}}
            />

            <ResendSection onResend={handleResend} />

            <Animated.View style={btnAnimStyle}>
              <TouchableOpacity
                style={[s.submitBtn, !isComplete && s.submitDisabled]}
                onPress={handleVerify}
                onPressIn={() => (btnScale.value = withSpring(0.97))}
                onPressOut={() => (btnScale.value = withSpring(1))}
                activeOpacity={0.85}
                disabled={!isComplete}
              >
                <Text style={s.submitText}>Verifikasi</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
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
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  otpBox: {
    flex: 1,
    maxWidth: 56,
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    color: C.text,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },

  resendSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 28,
    gap: 4,
  },
  resendText: { fontSize: 14, color: C.textSecondary },
  resendLink: { fontSize: 15, fontWeight: '700', color: C.primary },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    gap: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

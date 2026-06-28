import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  type SharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_W = SCREEN_W - 80;
const DURATION = 2200;

const C = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryBg: '#ccfbf1',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  track: '#e2e8f0',
};

function LogoSection() {
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={s.logoWrap}
    >
      <View style={s.iconBox}>
        <Ionicons name="medkit" size={36} color={C.primary} />
      </View>
      <View style={s.brandWrap}>
        <Text style={s.brandTop}>Puskesmas</Text>
        <Text style={s.brandBottom}>Setiabudi</Text>
      </View>
      <Text style={s.tagline}>Antrian Mudah, Pelayanan Cepat</Text>
    </Animated.View>
  );
}

function ProgressBar({ progress }: { progress: SharedValue<number> }) {
  const barStyle = useAnimatedStyle(() => ({
    width: BAR_W * (progress.value / 100),
  }));

  return (
    <View style={s.track}>
      <Animated.View style={[s.indicator, barStyle]} />
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer}>
      <Ionicons name="location-outline" size={13} color={C.textMuted} />
      <Text style={s.footerText}>PUSKESMAS SETIABUDI</Text>
    </View>
  );
}

export function SplashScreen() {
  const progress = useSharedValue(0);
  const router = useRouter();

  useEffect(() => {
    progress.value = withTiming(100, {
      duration: DURATION,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    const timer = setTimeout(() => {
      router.replace('/login');
    }, DURATION + 200);

    return () => clearTimeout(timer);
  }, [progress, router]);

  return (
    <View style={s.root}>
      <View style={s.center}>
        <LogoSection />
        <View style={s.barSection}>
          <ProgressBar progress={progress} />
        </View>
      </View>
      <Footer />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    marginTop: -60,
  },

  logoWrap: {
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  brandWrap: { alignItems: 'center', gap: 1 },
  brandTop: {
    fontSize: 22,
    fontWeight: '500',
    color: C.text,
  },
  brandBottom: {
    fontSize: 26,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 4,
  },

  barSection: {
    marginTop: 40,
  },
  track: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.track,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: C.primary,
  },

  footer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 0.8,
  },
});

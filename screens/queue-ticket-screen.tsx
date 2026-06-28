import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeInDown,
  withRepeat,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useQueueTicket, Antrean } from '@/hooks/use-queue-ticket';

const C = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryBg: '#ccfbf1',
  primaryBgLight: '#f0fdfa',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  inputBg: '#f1f5f9',
  waitingBg: '#fef3c7',
  waitingText: '#92400e',
  waitingDot: '#d97706',
  gridBg: '#f1f5f9',
};

function PulseDot() {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 1000 }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[s.pulseDot, style]} />;
}

function Header() {
  return (
    <View style={s.headerSection}>
      <Text style={s.headerTitle}>ANTREAN ANDA</Text>
    </View>
  );
}

function LiveTicket({ antrean }: { antrean: Antrean | null }) {
  const nomor = antrean?.nomor ?? '---';
  const poliName = antrean?.poli?.name ?? 'Memuat...';
  const lokasi = antrean?.poli?.lokasi ?? '';

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={s.ticketCard}
    >
      <View style={s.statusBadge}>
        <PulseDot />
        <Text style={s.statusText}>Menunggu</Text>
      </View>

      <Text style={s.ticketLabel}>NOMOR ANTREAN ANDA</Text>
      <Text style={s.ticketNumber}>{nomor}</Text>

      <View style={s.locationSection}>
        <Text style={s.poliName}>{poliName}</Text>
        {lokasi ? <Text style={s.locationText}>{lokasi}</Text> : null}
      </View>
    </Animated.View>
  );
}

function StatusGrid({
  sedangDilayani,
  estimasi,
}: {
  sedangDilayani: string;
  estimasi: string;
}) {
  return (
    <View style={s.gridRow}>
      <View style={s.gridCard}>
        <Text style={s.gridLabel}>Sedang Dilayani</Text>
        <Text style={sedangDilayani === '---' ? s.gridValueMuted : s.gridValue}>{sedangDilayani}</Text>
      </View>
      <View style={s.gridCard}>
        <Text style={s.gridLabel}>Estimasi Menunggu</Text>
        <Text style={s.gridValueDark}>{estimasi}</Text>
      </View>
    </View>
  );
}

function CheckinSection() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(150).springify()}
      style={s.checkinCard}
    >
      <View style={s.checkinIconWrap}>
        <Ionicons name="qr-code-outline" size={28} color={C.primary} />
      </View>
      <View style={s.checkinBody}>
        <Text style={s.checkinTitle}>Check-in Kehadiran</Text>
        <Text style={s.checkinDesc}>
          Pindai kode QR ini untuk memastikan bahwa anda hadir untuk konsultasi
        </Text>
      </View>
    </Animated.View>
  );
}

export function QueueTicketScreen() {
  const { antrean, currentServing, estWaitLabel } = useQueueTicket();

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <LiveTicket antrean={antrean} />
          <StatusGrid
            sedangDilayani={currentServing ?? '---'}
            estimasi={estWaitLabel}
          />
          <CheckinSection />
          <View style={s.spacer} />
        </ScrollView>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  headerSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.8,
  },

  ticketCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.waitingBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 8,
    marginBottom: 20,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.waitingDot,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: C.waitingText,
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMuted,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  ticketNumber: {
    fontSize: 52,
    fontWeight: '800',
    color: C.primary,
    letterSpacing: 2,
    marginBottom: 20,
  },
  locationSection: { alignItems: 'center', gap: 2 },
  poliName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textSecondary,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
  },

  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: C.gridBg,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textMuted,
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 24,
    fontWeight: '800',
    color: C.primary,
  },
  gridValueMuted: {
    fontSize: 20,
    fontWeight: '600',
    color: C.textMuted,
  },
  gridValueDark: {
    fontSize: 24,
    fontWeight: '800',
    color: C.text,
  },

  checkinCard: {
    flexDirection: 'row',
    backgroundColor: C.gridBg,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  checkinIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinBody: { flex: 1, gap: 4 },
  checkinTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  checkinDesc: {
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 17,
  },

  spacer: { height: 20 },
});

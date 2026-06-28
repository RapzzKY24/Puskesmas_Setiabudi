import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useEResume, type EResume } from '@/hooks/use-e-resume';
import { C } from '@/styles/theme';

function TopBar() {
  const router = useRouter();
  return (
    <View style={s.topBar}>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={s.topBtn}
      >
        <Ionicons name="arrow-back-outline" size={24} color={C.text} />
      </TouchableOpacity>
      <Text style={s.topTitle}>E-RESUME</Text>
      <TouchableOpacity
        onPress={() => {}}
        activeOpacity={0.7}
        style={s.topBtn}
      >
        <Ionicons name="download-outline" size={22} color={C.primary} />
      </TouchableOpacity>
    </View>
  );
}

function SummaryCard({ resume }: { resume: EResume }) {
  const appointment = resume.appointment;
  const status = appointment?.status ?? 'COMPLETED';
  const dateStr = appointment?.tanggal ?? '-';
  const poliName = appointment?.poli?.name ?? '-';
  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={s.summaryCard}
    >
      <View style={s.summaryTop}>
        <View style={s.statusBadge}>
          <Text style={s.statusText}>{status}</Text>
        </View>
        <View style={s.summaryDate}>
          <Ionicons name="calendar-outline" size={14} color={C.textMuted} />
          <Text style={s.summaryDateText}>{dateStr}</Text>
        </View>
      </View>

      <View style={s.summaryRow}>
        <Ionicons name="medical-outline" size={16} color={C.primary} />
        <Text style={s.summaryLabel}>Poli Tujuan</Text>
        <Text style={s.summaryValue}>{poliName}</Text>
      </View>
    </Animated.View>
  );
}

function DiagnosaCard({ diagnosa, deskripsi }: { diagnosa?: string | null; deskripsi?: string | null }) {
  if (!diagnosa && !deskripsi) return null;
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(80).springify()}
      style={s.diagCard}
    >
      <View style={s.diagHeader}>
        <Ionicons name="document-text-outline" size={18} color={C.primary} />
        <Text style={s.diagHeaderTitle}>HASIL PEMERIKSAAN</Text>
      </View>
      {diagnosa ? (
        <View style={s.diagRow}>
          <Text style={s.diagLabel}>Diagnosa</Text>
          <Text style={s.diagValue}>{diagnosa}</Text>
        </View>
      ) : null}
      {deskripsi ? (
        <View style={s.diagRow}>
          <Text style={s.diagLabel}>Deskripsi</Text>
          <Text style={s.diagValue}>{deskripsi}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

function ObatCard({ obat }: { obat: { name: string; rule: string }[] }) {
  if (obat.length === 0) return null;
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(160).springify()}
      style={s.obatCard}
    >
      <View style={s.obatHeader}>
        <Ionicons name="medkit-outline" size={18} color={C.primary} />
        <Text style={s.obatHeaderTitle}>RESEP OBAT</Text>
      </View>
      {obat.map((o, idx) => (
        <View
          key={idx}
          style={[s.obatRow, idx === obat.length - 1 && s.obatRowLast]}
        >
          <View style={s.obatBullet}>
            <Text style={s.obatBulletText}>{idx + 1}</Text>
          </View>
          <View style={s.obatBody}>
            <Text style={s.obatName}>{o.name}</Text>
            <Text style={s.obatRule}>{o.rule}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

function DisclaimerCard() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(240).springify()}
      style={s.discCard}
    >
      <View style={s.discLeft}>
        <Ionicons name="information-circle-outline" size={22} color={C.primary} />
      </View>
      <View style={s.discBody}>
        <Text style={s.discTitle}>INFORMASI PENTING</Text>
        <Text style={s.discDesc}>
          E-Resume ini bersifat informatif. Konsultasikan dengan dokter atau
          petugas kesehatan untuk penanganan lebih lanjut.
        </Text>
      </View>
    </Animated.View>
  );
}

export function EResumeScreen() {
  const { resume, loading } = useEResume();

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.flex}>
          <TopBar />
          <View style={s.center}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
          <BottomNav />
        </View>
      </SafeAreaView>
    );
  }

  if (!resume) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.flex}>
          <TopBar />
          <View style={s.center}>
            <Ionicons name="document-outline" size={48} color={C.textMuted} />
            <Text style={s.emptyText}>E-Resume tidak ditemukan</Text>
          </View>
          <BottomNav />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <TopBar />
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SummaryCard resume={resume} />
          <DiagnosaCard diagnosa={resume.diagnosa} deskripsi={resume.deskripsi} />
          <ObatCard obat={resume.obat} />
          <DisclaimerCard />
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.textMuted },
  scrollContent: { paddingBottom: 8 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
    backgroundColor: C.card,
  },
  topBtn: { width: 40, alignItems: 'center' },
  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.6,
  },

  summaryCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    backgroundColor: C.successBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusText: { fontSize: 11, fontWeight: '700', color: C.successText, letterSpacing: 0.5 },
  summaryDate: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryDateText: { fontSize: 12, color: C.textMuted },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryLabel: { fontSize: 13, color: C.textSecondary },
  summaryValue: { fontSize: 13, fontWeight: '700', color: C.text, marginLeft: 'auto' },

  diagCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  diagHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  diagHeaderTitle: { fontSize: 14, fontWeight: '700', color: C.primary, letterSpacing: 0.5 },
  diagRow: { marginBottom: 12 },
  diagLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted, marginBottom: 4 },
  diagValue: { fontSize: 15, fontWeight: '600', color: C.text, lineHeight: 22, backgroundColor: C.diagBg, borderRadius: 12, padding: 12 },

  obatCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  obatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  obatHeaderTitle: { fontSize: 14, fontWeight: '700', color: C.primary, letterSpacing: 0.5 },
  obatRow: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  obatRowLast: { borderBottomWidth: 0 },
  obatBullet: { width: 24, height: 24, borderRadius: 12, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' },
  obatBulletText: { fontSize: 12, fontWeight: '700', color: C.primary },
  obatBody: { flex: 1, gap: 2 },
  obatName: { fontSize: 15, fontWeight: '600', color: C.text },
  obatRule: { fontSize: 13, color: C.textSecondary },

  discCard: {
    flexDirection: 'row',
    backgroundColor: C.primaryBgLight,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    gap: 14,
    alignItems: 'flex-start',
  },
  discLeft: { paddingTop: 2 },
  discBody: { flex: 1, gap: 4 },
  discTitle: { fontSize: 13, fontWeight: '700', color: C.primaryDark },
  discDesc: { fontSize: 12, color: C.textSecondary, lineHeight: 18 },

  spacer: { height: 20 },
});

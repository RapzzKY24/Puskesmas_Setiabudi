import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomNav } from './bottom-nav';

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
  successBg: '#dcfce7',
  successText: '#166534',
  diagBg: '#f0fdfa',
};

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

function SummaryCard() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={s.summaryCard}
    >
      <View style={s.summaryTop}>
        <View style={s.statusBadge}>
          <Text style={s.statusText}>SELESAI</Text>
        </View>
        <Text style={s.summaryDate}>28 Sep 2025 , 10.45</Text>
      </View>
      <Text style={s.summaryPoli}>Poli Kesehatan Gigi</Text>
    </Animated.View>
  );
}

function RingkasanSection() {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name="document-text-outline" size={18} color={C.primary} />
        <Text style={s.sectionTitle}>RINGKASAN</Text>
      </View>
      <View style={s.ringkasanCard}>
        <RingkasanItem
          icon="calendar-outline"
          label="TANGGAL KUNJUNGAN"
          value="28 SEPTEMBER 2025 , 10.45"
        />
        <RingkasanItem
          icon="business-outline"
          label="POLI"
          value="Poli Kesehatan Gigi"
        />
        <RingkasanItem
          icon="chatbubble-ellipses-outline"
          label="KELUHAN"
          value="Sakit Gigi Sejak 2 Hari Lalu"
          isLast
        />
      </View>
    </View>
  );
}

function RingkasanItem({
  icon,
  label,
  value,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <>
      <View style={s.ringkasanRow}>
        <View style={s.ringkasanIcon}>
          <Ionicons name={icon} size={18} color={C.primary} />
        </View>
        <View style={s.ringkasanBody}>
          <Text style={s.ringkasanLabel}>{label}</Text>
          <Text style={s.ringkasanValue}>{value}</Text>
        </View>
      </View>
      {!isLast && <View style={s.ringkasanDivider} />}
    </>
  );
}

function DiagnosaSection() {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name="fitness-outline" size={18} color={C.primary} />
        <Text style={s.sectionTitle}>DIAGNOSA</Text>
      </View>
      <Animated.View
        entering={FadeInDown.duration(400).delay(100).springify()}
        style={s.diagCard}
      >
        <View style={s.diagContent}>
          <Text style={s.diagTitle}>Karies Gigi (K02.9)</Text>
          <Text style={s.diagDesc}>Karies Geraham Kanan Bawah Berlubang.</Text>
        </View>
        <TouchableOpacity style={s.diagBtn} activeOpacity={0.8}>
          <Text style={s.diagBtnText}>Lihat Detail</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function ResepSection() {
  const obatList = [
    { name: 'Amoxicilin 500mg', rule: '3x1 setelah makan' },
    { name: 'Ibu Profen 400mg', rule: '2x1 saat nyeri' },
  ];

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name="medkit-outline" size={18} color={C.primary} />
        <Text style={s.sectionTitle}>RESEP OBAT</Text>
      </View>
      <View style={s.obatList}>
        {obatList.map((obat, idx) => (
          <Animated.View
            key={idx}
            entering={FadeIn.duration(300).delay(150 + idx * 80)}
            style={s.obatCard}
          >
            <View style={s.obatIcon}>
              <Ionicons name="ellipse-outline" size={20} color={C.primary} />
            </View>
            <View style={s.obatBody}>
              <Text style={s.obatName}>{obat.name}</Text>
              <Text style={s.obatRule}>{obat.rule}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

export function EResumeScreen() {
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <TopBar />
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SummaryCard />
          <RingkasanSection />
          <DiagnosaSection />
          <ResepSection />
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
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: C.successBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.successText,
    letterSpacing: 0.5,
  },
  summaryDate: { fontSize: 13, color: C.textMuted },
  summaryPoli: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.6,
  },

  ringkasanCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ringkasanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  ringkasanIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringkasanBody: { flex: 1, gap: 2 },
  ringkasanLabel: { fontSize: 11, fontWeight: '500', color: C.textMuted },
  ringkasanValue: { fontSize: 14, fontWeight: '600', color: C.text },
  ringkasanDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 68,
  },

  diagCard: {
    flexDirection: 'row',
    backgroundColor: C.diagBg,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 12,
  },
  diagContent: { flex: 1, gap: 4 },
  diagTitle: { fontSize: 15, fontWeight: '700', color: C.primaryDark },
  diagDesc: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },
  diagBtn: {
    backgroundColor: C.successBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  diagBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.successText,
  },

  obatList: { gap: 10 },
  obatCard: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    alignItems: 'center',
  },
  obatIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obatBody: { flex: 1, gap: 2 },
  obatName: { fontSize: 15, fontWeight: '600', color: C.text },
  obatRule: { fontSize: 13, color: C.textMuted },

  spacer: { height: 20 },
});

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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomNav } from './bottom-nav';

const C = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryBg: '#ccfbf1',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  inputBg: '#f1f5f9',
  warningBg: '#fef3c7',
  warningText: '#92400e',
  danger: '#dc2626',
  infoBg: '#f1f5f9',
};

const DATA = {
  umum: {
    nama: 'LEXA NAMIKO PREMASTA',
    nik: '103062400086',
    handphone: '24 JANUARI 2026',
  },
  kunjungan: {
    poli: 'POLI JANTUNG',
    keluhan: 'SESAK NAFAS 2 HARI',
    tanggal: '24 JANUARI 2026',
  },
  antrean: {
    nomor: 'A-024',
    dilayani: 'A-018',
    status: 'MENUNGGU DIPANGGIL',
    estimasi: '15 MENIT LAGI',
  },
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
      <Text style={s.headerTitle}>TIKET ANTREAN</Text>
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

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIcon}>
        <Ionicons name="person-outline" size={16} color={C.primary} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
  valueBold,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  valueBold?: boolean;
}) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoLabel}>
        <Ionicons name={icon} size={15} color={C.textMuted} />
        <Text style={s.labelText}>{label}</Text>
      </View>
      <Text
        style={[
          s.valueText,
          valueColor ? { color: valueColor } : undefined,
          valueBold ? { fontWeight: '700' } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoAlert() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(200).springify()}
      style={s.alertCard}
    >
      <View style={s.alertLeft}>
        <Ionicons name="information-circle-outline" size={24} color={C.primary} />
      </View>
      <View style={s.alertBody}>
        <Text style={s.alertLabel}>PERHATIKAN</Text>
        <Text style={s.alertDesc}>
          Harap Perhatikan Antrean . Nomor Antrean Dapat Berubah Sewaktu Waktu
        </Text>
      </View>
    </Animated.View>
  );
}

export function TicketDetailScreen() {
  const a = DATA;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <TopBar />
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={s.sectionCard}
          >
            <SectionHeader title="INFORMASI UMUM" />
            <InfoRow icon="person-outline" label="Nama" value={a.umum.nama} />
            <InfoRow icon="card-outline" label="NIK" value={a.umum.nik} />
            <InfoRow icon="call-outline" label="Nomor Handphone" value={a.umum.handphone} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(400).delay(80).springify()}
            style={s.sectionCard}
          >
            <SectionHeader title="INFORMASI KUNJUNGAN" />
            <InfoRow icon="medical-outline" label="Poli Tujuan" value={a.kunjungan.poli} />
            <InfoRow icon="document-text-outline" label="Keluhan" value={a.kunjungan.keluhan} />
            <InfoRow icon="calendar-outline" label="Tanggal Kunjungan" value={a.kunjungan.tanggal} />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(400).delay(160).springify()}
            style={s.sectionCard}
          >
            <SectionHeader title="INFORMASI ANTREAN" />
            <InfoRow icon="ticket-outline" label="Nomor Antrean" value={a.antrean.nomor} />
            <InfoRow icon="people-outline" label="Sedang Dilayani" value={a.antrean.dilayani} />
            <InfoRow
              icon="alert-circle-outline"
              label="Status"
              value={a.antrean.status}
              valueColor={C.warningText}
              valueBold
            />
            <InfoRow icon="time-outline" label="Estimasi Waktu" value={a.antrean.estimasi} />
          </Animated.View>

          <InfoAlert />
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.6,
  },

  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.5,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 13,
    color: C.textSecondary,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },

  alertCard: {
    flexDirection: 'row',
    backgroundColor: C.infoBg,
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    gap: 14,
    alignItems: 'flex-start',
  },
  alertLeft: { paddingTop: 2 },
  alertBody: { flex: 1, gap: 4 },
  alertLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.danger,
  },
  alertDesc: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
  },

  spacer: { height: 20 },
});

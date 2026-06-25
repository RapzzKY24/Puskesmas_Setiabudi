import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
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
  successBg: '#dcfce7',
  successText: '#166534',
  dangerBg: '#fef2f2',
  dangerText: '#991b1b',
};

interface HistoryItem {
  id: string;
  poliName: string;
  date: string;
  time: string;
  status: 'SELESAI' | 'BATAL';
}

const HISTORY_DATA: HistoryItem[] = [
  { id: '1', poliName: 'Poli Kesehatan Gigi', date: '28 Sep 2025', time: '10:45 WIB', status: 'SELESAI' },
  { id: '2', poliName: 'Poli Penyakit Kulit', date: '15 Sep 2025', time: '09:30 WIB', status: 'SELESAI' },
  { id: '3', poliName: 'Poli Anak', date: '02 Sep 2025', time: '11:00 WIB', status: 'SELESAI' },
  { id: '4', poliName: 'Poli THT', date: '20 Agu 2025', time: '08:15 WIB', status: 'SELESAI' },
  { id: '5', poliName: 'Poli Jantung', date: '10 Agu 2025', time: '13:00 WIB', status: 'BATAL' },
  { id: '6', poliName: 'Poli Mata', date: '28 Jul 2025', time: '10:00 WIB', status: 'SELESAI' },
  { id: '7', poliName: 'Poli Umum', date: '15 Jul 2025', time: '07:30 WIB', status: 'SELESAI' },
  { id: '8', poliName: 'Poli Kandungan & Kebidanan', date: '01 Jul 2025', time: '09:45 WIB', status: 'SELESAI' },
];

function Header() {
  return (
    <View style={s.headerSection}>
      <Text style={s.headerTitle}>RIWAYAT KUNJUNGAN</Text>
      <Text style={s.headerSub}>
        Catatan Perjalanan Kesehatan Anda Di Puskesmas Setiabudi.
      </Text>
    </View>
  );
}

function HistoryCard({ item, index }: { item: HistoryItem; index: number }) {
  const isSelesai = item.status === 'SELESAI';
  const router = useRouter();

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 80).springify()}
    >
      <View style={s.card}>
        <View style={s.cardTop}>
          <View
            style={[
              s.statusBadge,
              isSelesai ? s.badgeSelesai : s.badgeBatal,
            ]}
          >
            <Text
              style={[
                s.statusText,
                isSelesai ? s.statusSelesai : s.statusBatal,
              ]}
            >
              {item.status}
            </Text>
          </View>
          <View style={s.dateWrap}>
            <Text style={s.dateText}>{item.date}</Text>
            <Text style={s.timeText}>{item.time}</Text>
          </View>
        </View>

        <Text style={s.poliName}>{item.poliName}</Text>

        {isSelesai && (
          <TouchableOpacity
            style={s.resumeBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/(app)/e-resume')}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color="#fff"
            />
            <Text style={s.resumeText}>E-Resume</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

function HistoryList() {
  return (
    <View style={s.listSection}>
      {HISTORY_DATA.map((item, idx) => (
        <HistoryCard key={item.id} item={item} index={idx} />
      ))}
    </View>
  );
}

export function HistoryScreen() {
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <HistoryList />
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

  headerSection: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  headerSub: { fontSize: 14, color: C.textMuted, lineHeight: 20 },

  listSection: { paddingHorizontal: 20, gap: 14 },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  badgeSelesai: { backgroundColor: C.successBg },
  badgeBatal: { backgroundColor: C.dangerBg },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusSelesai: { color: C.successText },
  statusBatal: { color: C.dangerText },
  dateWrap: { alignItems: 'flex-end', gap: 1 },
  dateText: { fontSize: 13, fontWeight: '600', color: C.text },
  timeText: { fontSize: 12, color: C.textMuted },

  poliName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    marginBottom: 14,
  },

  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 12,
    height: 42,
    gap: 6,
  },
  resumeText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  spacer: { height: 20 },
});

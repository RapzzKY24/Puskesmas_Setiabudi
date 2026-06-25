import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomNav } from './bottom-nav';

const { width: SCREEN_W } = Dimensions.get('window');
const DATE_W = (SCREEN_W - 64) / 4.5;

const C = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  primaryLight: '#14b8a6',
  primaryBg: '#ccfbf1',
  primaryBgLight: '#f0fdfa',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  inputBg: '#f1f5f9',
  successBg: '#dcfce7',
  successText: '#166534',
  orangeBg: '#fff7ed',
  orangeText: '#9a3412',
};

type PoliData = {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  desc: string;
  estWait: string;
  queueCount: number;
  active: boolean;
};

const POLIS: PoliData[] = [
  {
    id: 'umum',
    name: 'Poli Umum',
    icon: 'medkit-outline',
    iconBg: '#e0f2fe',
    desc: 'Layanan pemeriksaan kesehatan dasar dan konsultasi medis umum.',
    estWait: '15 Menit',
    queueCount: 9,
    active: true,
  },
  {
    id: 'gigi',
    name: 'Poli Gigi',
    icon: 'fitness-outline',
    iconBg: '#f1f5f9',
    desc: 'Perawatan gigi dan mulut termasuk pencabutan, tambal, dan scaling.',
    estWait: '20 Menit',
    queueCount: 5,
    active: false,
  },
  {
    id: 'mata',
    name: 'Poli Mata',
    icon: 'eye-outline',
    iconBg: '#fef3c7',
    desc: 'Pemeriksaan visus, refraksi, dan penanganan gangguan penglihatan.',
    estWait: '25 Menit',
    queueCount: 7,
    active: false,
  },
  {
    id: 'anak',
    name: 'Poli Anak',
    icon: 'people-outline',
    iconBg: '#fce7f3',
    desc: 'Pelayanan kesehatan khusus untuk bayi, anak, dan remaja.',
    estWait: '10 Menit',
    queueCount: 3,
    active: false,
  },
];

function generateDates() {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const result: { dayName: string; date: number; month: string; full: Date }[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      dayName: days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
      full: d,
    });
  }
  return result;
}

const DATES = generateDates();

function Header() {
  return (
    <View style={s.headerSection}>
      <Text style={s.headerTitle}>RESERVASI LAYANAN</Text>
      <Text style={s.headerSub}>
        Silakan Pilih Layanan Poliklinik Dan Jadwal Kunjungan Anda.
      </Text>
    </View>
  );
}

interface DateCardProps {
  item: (typeof DATES)[0];
  selected: boolean;
  onPress: () => void;
}

function DateCard({ item, selected, onPress }: DateCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[s.dateCard, selected && s.dateCardActive]}
    >
      <Text style={[s.dateDay, selected && s.dateDayActive]}>
        {item.dayName}
      </Text>
      <Text style={[s.dateNum, selected && s.dateNumActive]}>
        {item.date}
      </Text>
      <Text style={[s.dateMonth, selected && s.dateMonthActive]}>
        {item.month}
      </Text>
    </TouchableOpacity>
  );
}

function DatePicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (d: Date) => void;
}) {
  return (
    <View style={s.dateSection}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionLabel}>PILIH TANGGAL</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={s.sectionLink}>Lihat Kalender</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.dateScroll}
        snapToInterval={DATE_W + 8}
        decelerationRate="fast"
      >
        {DATES.map((d, idx) => (
          <DateCard
            key={idx}
            item={d}
            selected={d.full.toDateString() === selectedDate.toDateString()}
            onPress={() => onSelect(d.full)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface PoliCardProps {
  poli: PoliData;
  selected: boolean;
  onPress: () => void;
  index: number;
}

function PoliCard({ poli, selected, onPress, index }: PoliCardProps) {
  const scale = useSharedValue(1);

  return (
    <Animated.View
      entering={FadeInRight.duration(300).delay(index * 80)}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98))}
        onPressOut={() => (scale.value = withSpring(1))}
        style={[s.poliCard, selected && s.poliCardActive]}
      >
        <View style={s.poliTop}>
          <View style={[s.poliIcon, { backgroundColor: poli.iconBg }]}>
            <Ionicons name={poli.icon} size={22} color={C.primaryDark} />
          </View>
          {selected && (
            <View style={s.poliBadge}>
              <Text style={s.poliBadgeText}>Aktif</Text>
            </View>
          )}
        </View>

        <Text style={s.poliName}>{poli.name}</Text>
        <Text style={s.poliDesc}>{poli.desc}</Text>

        <View style={s.poliDivider} />

        <View style={s.poliMeta}>
          <View style={s.poliMetaItem}>
            <Ionicons name="time-outline" size={14} color={C.primary} />
            <Text style={s.poliMetaText}>
              ESTIMASI TUNGGU: <Text style={s.poliMetaBold}>{poli.estWait}</Text>
            </Text>
          </View>
          <Text style={s.poliQueue}>ANTREAN: {poli.queueCount} Orang</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function ReservationScreen() {
  const [selectedDate, setSelectedDate] = useState(DATES[0].full);
  const [selectedPoli, setSelectedPoli] = useState('umum');
  const router = useRouter();

  const handlePoliPress = useCallback(
    (poli: PoliData) => {
      const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
      const months = [
        'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
        'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER',
      ];
      const label = `${days[selectedDate.getDay()]}, ${selectedDate.getDate()} ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

      setSelectedPoli(poli.id);
      router.push({
        pathname: '/appointment',
        params: { poliName: poli.name, dateLabel: label },
      });
    },
    [selectedDate, router],
  );

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <DatePicker
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
          <View style={s.poliSection}>
            <Text style={s.sectionLabel}>PILIH LAYANAN POLI</Text>
            {POLIS.map((poli, idx) => (
              <PoliCard
                key={poli.id}
                poli={poli}
                selected={selectedPoli === poli.id}
                onPress={() => handlePoliPress(poli)}
                index={idx}
              />
            ))}
          </View>
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
    marginBottom: 6,
  },
  headerSub: { fontSize: 14, color: C.textMuted, lineHeight: 20 },

  dateSection: { marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.5,
  },
  sectionLink: { fontSize: 13, fontWeight: '600', color: C.primary },
  dateScroll: { paddingHorizontal: 20, gap: 8 },
  dateCard: {
    width: DATE_W,
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  dateCardActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  dateDay: { fontSize: 12, fontWeight: '600', color: C.textSecondary },
  dateDayActive: { color: 'rgba(255,255,255,0.85)' },
  dateNum: { fontSize: 18, fontWeight: '800', color: C.text },
  dateNumActive: { color: '#fff' },
  dateMonth: { fontSize: 11, fontWeight: '500', color: C.textMuted },
  dateMonthActive: { color: 'rgba(255,255,255,0.75)' },

  poliSection: { marginTop: 24, paddingHorizontal: 20, gap: 14 },
  poliCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  poliCardActive: {
    borderColor: C.primary,
    borderWidth: 2,
  },
  poliTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  poliIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poliBadge: {
    backgroundColor: C.successBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  poliBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.successText,
  },
  poliName: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  poliDesc: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  poliDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 12,
  },
  poliMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poliMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  poliMetaText: { fontSize: 11, color: C.textSecondary },
  poliMetaBold: { fontWeight: '700', color: C.primary },
  poliQueue: { fontSize: 11, fontWeight: '600', color: C.textMuted },

  spacer: { height: 20 },
});

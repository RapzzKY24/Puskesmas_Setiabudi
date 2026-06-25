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
  infoBg: '#e0f2fe',
  infoText: '#0369a1',
  accent: '#0284c7',
};

interface NotificationItem {
  id: string;
  group: 'hari-ini' | 'kemarin';
  type: 'interactive' | 'info' | 'confirm';
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  category: string;
  categoryColor: string;
  time: string;
  title: string;
  description: string;
  accentBorder?: boolean;
  actions?: { primary?: string; secondary?: string };
}

const NOTIF_DATA: NotificationItem[] = [
  {
    id: '1',
    group: 'hari-ini',
    type: 'interactive',
    icon: 'notifications-outline',
    iconBg: '#e0f2fe',
    category: 'PANGGILAN ANTREAN',
    categoryColor: C.primary,
    time: '09:41',
    title: 'Nomor Anda akan segera dipanggil',
    description:
      'Persiapkan diri Anda, nomor antrean A-12 sedang menuju giliran.',
    actions: { primary: 'Lihat Tiket', secondary: 'Nanti' },
  },
  {
    id: '2',
    group: 'hari-ini',
    type: 'info',
    icon: 'walk-outline',
    iconBg: '#e0f2fe',
    category: 'PETUNJUK LOKASI',
    categoryColor: C.accent,
    time: '09:30',
    title: 'Silakan menuju Poli Umum',
    description:
      'Lokasi Poli Umum berada di Lantai 2, Gedung B. Gunakan lift utama untuk akses lebih cepat.',
    accentBorder: true,
  },
  {
    id: '3',
    group: 'hari-ini',
    type: 'info',
    icon: 'notifications-outline',
    iconBg: '#fef3c7',
    category: 'PENGINGAT',
    categoryColor: '#d97706',
    time: '08:00',
    title: 'Jadwal kontrol bulan depan',
    description:
      'Jangan lupa jadwal kontrol Anda dengan dr. Siti pada 24 Nov 2025.',
  },
  {
    id: '4',
    group: 'kemarin',
    type: 'confirm',
    icon: 'calendar-outline',
    iconBg: '#f1f5f9',
    category: 'Konfirmasi',
    categoryColor: C.textSecondary,
    time: '14:20',
    title: 'Jadwal Berhasil Dipesan',
    description:
      'Konsultasi dengan Dr. Siti Aminah pada 24 Okt.',
  },
  {
    id: '5',
    group: 'kemarin',
    type: 'confirm',
    icon: 'calendar-outline',
    iconBg: '#f1f5f9',
    category: 'Konfirmasi',
    categoryColor: C.textSecondary,
    time: '10:15',
    title: 'Pendaftaran Berhasil',
    description:
      'Poli Kesehatan Gigi, 28 Sep 2025 pukul 10.45 WIB.',
  },
];

function TopBar() {
  const router = useRouter();
  return (
    <View style={s.topBar}>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={s.backBtn}
      >
        <Ionicons name="arrow-back-outline" size={24} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>NOTIFIKASI</Text>
      <View style={s.backBtn} />
    </View>
  );
}

function GroupHeader({
  label,
  count,
}: {
  label: string;
  count?: string;
}) {
  return (
    <View style={s.groupHeader}>
      <Text style={s.groupLabel}>{label}</Text>
      {count && <Text style={s.groupCount}>{count}</Text>}
    </View>
  );
}

function NotifCard({ item, index }: { item: NotificationItem; index: number }) {
  const router = useRouter();
  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 60).springify()}
    >
      <View
        style={[
          s.card,
          item.accentBorder && s.cardAccent,
        ]}
      >
        <View style={s.cardBody}>
          <View style={s.cardLeft}>
            <View style={[s.iconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={18} color={item.categoryColor} />
            </View>
          </View>
          <View style={s.cardContent}>
            <View style={s.cardTop}>
              <Text
                style={[s.category, { color: item.categoryColor }]}
              >
                {item.category}
              </Text>
              <Text style={s.time}>{item.time}</Text>
            </View>
            <Text style={s.cardTitle}>{item.title}</Text>
            <Text style={s.cardDesc}>{item.description}</Text>

            {item.actions && (
              <View style={s.actions}>
                {item.actions.primary && (
                  <TouchableOpacity
                    style={s.actionPrimary}
                    activeOpacity={0.85}
                    onPress={() => router.push('/(app)/ticket-detail')}
                  >
                    <Text style={s.actionPrimaryText}>
                      {item.actions.primary}
                    </Text>
                  </TouchableOpacity>
                )}
                {item.actions.secondary && (
                  <TouchableOpacity
                    style={s.actionSecondary}
                    activeOpacity={0.7}
                  >
                    <Text style={s.actionSecondaryText}>
                      {item.actions.secondary}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export function NotificationsScreen() {
  const todayItems = NOTIF_DATA.filter((n) => n.group === 'hari-ini');
  const yesterdayItems = NOTIF_DATA.filter((n) => n.group === 'kemarin');

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <TopBar />
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GroupHeader label="HARI INI" count="3 Pesan Baru" />
          {todayItems.map((item, idx) => (
            <NotifCard key={item.id} item={item} index={idx} />
          ))}

          <GroupHeader label="KEMARIN" />
          {yesterdayItems.map((item, idx) => (
            <NotifCard
              key={item.id}
              item={item}
              index={todayItems.length + idx}
            />
          ))}

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
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.6,
  },

  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.5,
  },
  groupCount: {
    fontSize: 12,
    color: C.textMuted,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardAccent: {
    borderLeftWidth: 4,
    borderLeftColor: C.accent,
  },
  cardBody: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  cardLeft: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 4 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    color: C.textMuted,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionPrimary: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  actionPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  actionSecondary: {
    backgroundColor: C.background,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: C.border,
  },
  actionSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
  },

  spacer: { height: 20 },
});

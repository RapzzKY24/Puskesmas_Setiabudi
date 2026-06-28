import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useHistory, type HistoryItem } from '@/hooks/use-history';
import { C } from '@/styles/theme';

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
  const isSelesai = item.status === 'COMPLETED';
  const isBatal = item.status === 'CANCELLED';
  const isMenunggu = item.status === 'WAITING' || item.status === 'IN_PROGRESS';
  const router = useRouter();

  const badgeStyle = isSelesai ? s.badgeSelesai : isBatal ? s.badgeBatal : s.badgeMenunggu;
  const textStyle = isSelesai ? s.statusSelesai : isBatal ? s.statusBatal : s.statusMenunggu;

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 80).springify()}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push({
          pathname: '/(app)/ticket-detail',
          params: {
            appointmentId: item.id,
            poliName: item.poliName,
            date: item.date,
            time: item.time,
            status: item.status,
            keluhan: item.keluhan,
            nomorAntrean: item.nomorAntrean,
          },
        })}
      >
        <View style={s.card}>
          <View style={s.cardTop}>
            <View
              style={[
                s.statusBadge,
                badgeStyle,
              ]}
            >
              <Text
                style={[
                  s.statusText,
                  textStyle,
                ]}
              >
                {item.status === 'COMPLETED' ? 'SELESAI' :
                 item.status === 'CANCELLED' ? 'BATAL' :
                 item.status === 'WAITING' ? 'MENUNGGU' : 'DIPROSES'}
              </Text>
            </View>
            <View style={s.dateWrap}>
              <Text style={s.dateText}>{item.date}</Text>
              <Text style={s.timeText}>{item.time}</Text>
            </View>
          </View>

          <Text style={s.poliName}>{item.poliName}</Text>

          {item.nomorAntrean !== '-' && (
            <View style={s.nomorRow}>
              <Ionicons name="ticket-outline" size={14} color={C.primary} />
              <Text style={s.nomorText}>No. Antrean: {item.nomorAntrean}</Text>
            </View>
          )}

          {item.keluhan && (
            <Text style={s.keluhanText} numberOfLines={1}>{item.keluhan}</Text>
          )}

          {isSelesai && (
            <TouchableOpacity
              style={s.resumeBtn}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/(app)/e-resume', params: { appointmentId: item.id } })}
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
      </TouchableOpacity>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={s.emptyWrap}>
      <View style={s.emptyIconWrap}>
        <Ionicons name="document-text-outline" size={40} color={C.textMuted} />
      </View>
      <Text style={s.emptyTitle}>Belum Ada Kunjungan</Text>
      <Text style={s.emptyDesc}>
        Anda belum melakukan aktivitas apapun di Puskesmas.
      </Text>
    </View>
  );
}

export function HistoryScreen() {
  const { items, loaded } = useHistory();

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header />
          <View style={s.listSection}>
            {!loaded ? (
              <ActivityIndicator size="large" color={C.primary} style={s.loading} />
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              items.map((item, idx) => (
                <HistoryCard key={item.id} item={item} index={idx} />
              ))
            )}
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
  badgeMenunggu: { backgroundColor: C.waitingBg },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  statusSelesai: { color: C.successText },
  statusBatal: { color: C.dangerText },
  statusMenunggu: { color: C.waitingText },
  dateWrap: { alignItems: 'flex-end', gap: 1 },
  dateText: { fontSize: 13, fontWeight: '600', color: C.text },
  timeText: { fontSize: 12, color: C.textMuted },

  poliName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
  },

  nomorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  nomorText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },
  keluhanText: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 12,
    lineHeight: 16,
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

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.border + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  spacer: { height: 20 },
  loading: { marginTop: 40 },
});

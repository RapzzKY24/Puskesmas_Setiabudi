import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { useDashboard, type Promo, type QueueInfo } from '@/hooks/use-dashboard';
import { C } from '@/styles/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 48;
const PROMO_W = CARD_W * 0.75;

function TopBar({ nama }: { nama: string }) {
  const router = useRouter();
  return (
    <View style={s.topBar}>
      <TouchableOpacity
        style={s.profileRow}
        activeOpacity={0.7}
        onPress={() => router.push('/(app)/profile')}
      >
        <View style={s.avatar}>
          <Ionicons name="person" size={18} color="#fff" />
        </View>
        <View>
          <Text style={s.greeting}>Halo , Selamat Datang</Text>
          <Text style={s.userName}>{nama} 👋</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.notifBtn}
        activeOpacity={0.7}
        onPress={() => router.push('/(app)/notifications')}
      >
        <Ionicons name="notifications-outline" size={24} color={C.text} />
        <View style={s.notifBadge} />
      </TouchableOpacity>
    </View>
  );
}

function HeroSection() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={s.heroWrap}
    >
      <View style={s.heroBg}>
        <View style={s.heroContent}>
          <Text style={s.heroTitle}>Puskesmas Setiabudi</Text>
          <Text style={s.heroSub}>
            Ambil jadwal antrian online tanpa antre langsung
          </Text>
        </View>
        <View style={s.heroIllus}>
          <Ionicons name="medkit" size={48} color="rgba(255,255,255,0.25)" />
        </View>
      </View>

      <View style={s.searchOuter}>
        <View style={s.searchBar}>
          <Ionicons
            name="search-outline"
            size={20}
            color={C.textMuted}
            style={s.searchIcon}
          />
          <TextInput
            style={s.searchInput}
            placeholder="Cari Poli"
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
          />
        </View>
      </View>
    </Animated.View>
  );
}

function PromoCarousel({ promos }: { promos: Promo[] }) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { x: number } } }) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  }, [scrollX]);

  return (
    <View style={s.promoSection}>
      <Text style={s.sectionTitle}>Promo & Layanan</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={PROMO_W + 12}
        decelerationRate="fast"
        contentContainerStyle={s.promoScroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {promos.map((item, idx) => (
          <Animated.View
            key={item.id}
            entering={FadeInRight.duration(350).delay(idx * 100)}
          >
            <TouchableOpacity activeOpacity={0.85} style={s.promoCard}>
              <View
                style={[
                  s.promoInner,
                  { backgroundColor: item.color1 },
                ]}
              >
                <View style={s.promoInfo}>
                  <Text style={s.promoTitle}>{item.title}</Text>
                  <Text style={s.promoDesc} numberOfLines={2}>
                    {item.desc}
                  </Text>
                  <View style={s.promoBadge}>
                    <Ionicons
                      name="location-outline"
                      size={11}
                      color={C.primary}
                    />
                    <Text style={s.promoBadgeText}>{item.badge}</Text>
                  </View>
                </View>
                <View style={s.promoIllus}>
                  <Ionicons
                    name={item.icon as any}
                    size={36}
                    color={C.primaryLight}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

function QueueSection({ queueInfo, loading }: { queueInfo: QueueInfo | null; loading: boolean }) {
  const antrean = queueInfo?.antrean;
  const queueAhead = queueInfo?.queueAhead ?? 0;
  const estWaitLabel = queueInfo?.estWaitLabel ?? '< 1 Menit';

  if (loading) {
    return (
      <View style={s.queueSection}>
        <Text style={s.sectionTitle}>ANTREAN AKTIF</Text>
        <View style={s.queueCard}>
          <View style={s.emptyQueue}>
            <ActivityIndicator size="small" color={C.primary} />
            <Text style={s.emptyText}>Memuat antrean...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!antrean) return null;

  const poliName = antrean?.poli?.name ?? 'Poli';
  const queueNum = antrean?.nomor ?? '--';
  const isFirst = queueAhead === 0;

  return (
    <View style={s.queueSection}>
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { color: C.primary }]}>
          ANTREAN AKTIF
        </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={s.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={s.queueCard}
      >
        <View style={s.queueTop}>
          <View style={s.queueInfo}>
            <Text style={s.queuePoli}>{poliName}</Text>
            <Text style={s.queueStatus}>
              {isFirst
                ? `Anda antrean pertama. ${estWaitLabel}`
                : `Anda menunggu ${queueAhead} antrean lagi. ${estWaitLabel}`}
            </Text>
          </View>
          <View style={s.queueNumWrap}>
            <View style={s.queueNumHeader}>
              <Text style={s.queueNumLabel}>No</Text>
            </View>
            <View style={s.queueNumBody}>
              <Text style={s.queueNumValue}>{queueNum.split('-')[1]?.replace(/^0+/, '') || queueNum}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.confirmBtn} activeOpacity={0.8}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={C.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={s.confirmText}>
            {isFirst ? 'Anda dipanggil, silakan menuju poli' : 'Silakan menuju poli saat nomor Anda dipanggil'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export function DashboardScreen() {
  const { user, nama, loading, queueInfo, promos } = useDashboard();

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.flex}>
        <TopBar nama={nama} />
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HeroSection />
          <PromoCarousel promos={promos} />
          <QueueSection queueInfo={queueInfo} loading={loading} />
          <View style={s.bottomSpacer} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
    backgroundColor: C.card,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: { fontSize: 12, color: C.textSecondary },
  userName: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 1 },
  notifBtn: { position: 'relative', padding: 4 },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: C.card,
  },

  heroWrap: { marginBottom: 4 },
  heroBg: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  heroContent: { flex: 1, zIndex: 1 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 30,
    marginBottom: 8,
  },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  heroIllus: {
    position: 'absolute',
    right: -8,
    top: -8,
    opacity: 0.5,
  },

  searchOuter: {
    marginHorizontal: 20,
    marginTop: -24,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryDark,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  searchIcon: { marginRight: 10, opacity: 0.7 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    height: '100%',
  },

  promoSection: { marginTop: 28 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  promoScroll: { paddingHorizontal: 20, gap: 12 },
  promoCard: { width: PROMO_W, borderRadius: 20, overflow: 'hidden' },
  promoInner: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 130,
  },
  promoInfo: { flex: 1, justifyContent: 'space-between', gap: 6 },
  promoTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  promoDesc: { fontSize: 12, color: C.textSecondary, lineHeight: 16 },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  promoBadgeText: { fontSize: 10, color: C.primary, fontWeight: '500' },
  promoIllus: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },

  queueSection: { marginTop: 28, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAll: { fontSize: 13, fontWeight: '600', color: C.primary },

  queueCard: {
    backgroundColor: C.primaryBgLight,
    borderRadius: 20,
    overflow: 'hidden',
  },
  queueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  queueInfo: { flex: 1, paddingRight: 16, gap: 6 },
  queuePoli: { fontSize: 16, fontWeight: '700', color: C.text },
  queueStatus: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },
  queueNumWrap: {
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 64,
  },
  queueNumHeader: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  queueNumLabel: { fontSize: 11, fontWeight: '700', color: '#fff' },
  queueNumBody: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  queueNumValue: {
    fontSize: 26,
    fontWeight: '800',
    color: C.primaryDark,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 14,
  },
  confirmText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
  },

  emptyQueue: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: C.textMuted,
  },

  bottomSpacer: { height: 20 },
});

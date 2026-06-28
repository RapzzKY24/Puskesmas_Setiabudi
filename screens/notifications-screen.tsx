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
import { useNotifications, type NotificationItem } from '@/hooks/use-notifications';
import { C } from '@/styles/theme';

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
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export function NotificationsScreen() {
  const { loading, items, todayItems, yesterdayItems } = useNotifications();

  if (loading) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.flex}>
          <TopBar />
          <View style={s.loading}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
          <BottomNav />
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safeArea}>
        <View style={s.flex}>
          <TopBar />
          <View style={s.loading}>
            <Ionicons name="notifications-off-outline" size={48} color={C.textMuted} />
            <Text style={s.emptyText}>Belum ada notifikasi</Text>
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
          {todayItems.length > 0 && (
            <>
              <GroupHeader label="HARI INI" count={`${todayItems.length} Pesan Baru`} />
              {todayItems.map((item, idx) => (
                <NotifCard key={item.id} item={item} index={idx} />
              ))}
            </>
          )}

          {yesterdayItems.length > 0 && (
            <>
              <GroupHeader label="KEMARIN" />
              {yesterdayItems.map((item, idx) => (
                <NotifCard
                  key={item.id}
                  item={item}
                  index={todayItems.length + idx}
                />
              ))}
            </>
          )}

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

  spacer: { height: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.textMuted },
});

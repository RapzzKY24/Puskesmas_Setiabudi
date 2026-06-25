import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const C = {
  primary: '#0d9488',
  primaryBg: '#ccfbf1',
  card: '#ffffff',
  border: '#e2e8f0',
  navInactive: '#64748b',
};

type NavRoute = '/(app)' | '/(app)/antrean' | '/(app)/history';

const ITEMS: {
  route: NavRoute;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { route: '/(app)', icon: 'home-outline', iconActive: 'home', label: 'Beranda' },
  { route: '/(app)/antrean', icon: 'list-outline', iconActive: 'list', label: 'Antrean' },
  { route: '/(app)/history', icon: 'time-outline', iconActive: 'time', label: 'Riwayat' },
];

function NavItem({
  route,
  icon,
  iconActive,
  label,
  activeRoute,
  onPress,
}: {
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
  activeRoute: string;
  onPress: (route: string) => void;
}) {
  const isActive = activeRoute === route;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      style={s.item}
      onPress={() => onPress(route)}
      onPressIn={() => (scale.value = withSpring(0.92))}
      onPressOut={() => (scale.value = withSpring(1))}
      activeOpacity={1}
    >
      <Animated.View style={[s.pill, isActive && s.pillActive, animStyle]}>
        <Ionicons
          name={isActive ? iconActive : icon}
          size={22}
          color={isActive ? C.primary : C.navInactive}
        />
        <Text style={[s.label, isActive && s.labelActive]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function getActiveRoute(pathname: string): string {
  if (pathname.includes('/antrean')) return '/(app)/antrean';
  if (pathname.includes('/history')) return '/(app)/history';
  return '/(app)';
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const activeRoute = getActiveRoute(pathname);

  const handlePress = useCallback(
    (route: string) => {
      if (route !== activeRoute) {
        router.push(route as any);
      }
    },
    [activeRoute, router],
  );

  return (
    <View style={s.wrapper}>
      {ITEMS.map((item) => (
        <NavItem
          key={item.route}
          route={item.route}
          icon={item.icon}
          iconActive={item.iconActive}
          label={item.label}
          activeRoute={activeRoute}
          onPress={handlePress}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: C.card,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  item: { flex: 1, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 6,
  },
  pillActive: { backgroundColor: C.primaryBg },
  label: { fontSize: 13, fontWeight: '500', color: C.navInactive },
  labelActive: { color: C.primary, fontWeight: '700' },
});

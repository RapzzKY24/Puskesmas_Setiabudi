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
import { useProfile } from '@/hooks/use-profile';
import { C } from '@/styles/theme';

function Header() {
  const router = useRouter();
  return (
    <View style={s.header}>
      <TouchableOpacity
        style={s.backBtn}
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Profil</Text>
      <View style={s.headerRight} />
    </View>
  );
}

function AvatarSection({ nama }: { nama: string }) {
  const initials = nama
    ? nama.split(' ').map((n) => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    : '?';
  return (
    <View style={s.avatarSection}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials}</Text>
      </View>
      <Text style={s.avatarName}>{nama || 'Pengguna'}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string | null }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIconWrap}>
        <Ionicons name={icon as any} size={20} color={C.primary} />
      </View>
      <View style={s.infoContent}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );
}

export function ProfileScreen() {
  const { user, handleLogout } = useProfile();

  return (
    <SafeAreaView style={s.safeArea}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <Animated.View entering={FadeInDown.duration(300).springify()}>
          <AvatarSection nama={user?.nama || ''} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(300).delay(100).springify()}
          style={s.card}
        >
          <Text style={s.sectionTitle}>Informasi Akun</Text>
          <InfoRow icon="person-outline" label="Nama" value={user?.nama} />
          <View style={s.divider} />
          <InfoRow icon="call-outline" label="Nomor HP" value={user?.noHp} />
          <View style={s.divider} />
          <InfoRow icon="card-outline" label="NIK" value={user?.nik} />
          <View style={s.divider} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(300).delay(200).springify()}
          style={s.logoutSection}
        >
          <TouchableOpacity
            style={s.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={C.danger} />
            <Text style={s.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
  },
  headerRight: { width: 40 },

  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  avatarName: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 12,
    color: C.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },

  logoutSection: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    height: 54,
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.dangerBg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.danger,
  },
});

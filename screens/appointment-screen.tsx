import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Controller } from 'react-hook-form';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { useAppointment } from '@/hooks/use-appointment';
import { C } from '@/styles/theme';



function BackHeader() {
  const router = useRouter();
  return (
    <View style={s.backHeader}>
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={s.backBtn}
      >
        <Ionicons name="arrow-back-outline" size={24} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>BUAT JANJI TEMU</Text>
      <View style={s.backBtn} />
    </View>
  );
}

function SummaryCard({
  poliName,
  dateLabel,
  queueCount,
  estWait,
}: {
  poliName: string;
  dateLabel: string;
  queueCount: number;
  estWait: number;
}) {
  const estWaitTotal = queueCount * estWait;

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={s.summaryCard}
    >
      <View style={s.summaryBadge}>
        <Text style={s.summaryBadgeText}>MENDAFTAR</Text>
      </View>

      <Text style={s.summaryPoli}>{poliName}</Text>

      <View style={s.summaryDivider} />

      <View style={s.summaryGrid}>
        <View style={s.summaryGridItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={C.primary}
          />
          <Text style={s.summaryGridText}>{dateLabel}</Text>
        </View>
        <View style={s.summaryGridDivider} />
        <View style={s.summaryGridItem}>
          <Ionicons
            name="time-outline"
            size={16}
            color={C.primary}
          />
          <Text style={s.summaryGridText}>09.00 - 14.00</Text>
        </View>
      </View>

      {queueCount > 0 && (
        <View style={s.queuePositionWrap}>
          <View style={s.queuePositionRow}>
            <Ionicons name="layers-outline" size={14} color={C.orangeText} />
            <Text style={s.queuePositionLabel}>
              Posisi Antrean saat ini: <Text style={s.queuePositionBold}>{queueCount + 1}</Text> dari {queueCount + 1}
            </Text>
          </View>
          <View style={s.queuePositionRow}>
            <Ionicons name="hourglass-outline" size={14} color={C.orangeText} />
            <Text style={s.queuePositionLabel}>
              Estimasi Waktu: <Text style={s.queuePositionBold}>~{estWaitTotal} Menit</Text>
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

function PatientDataField({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={s.patientField}>
      <View style={s.patientIconWrap}>
        <Ionicons name={icon} size={18} color={C.primary} />
      </View>
      <View style={s.patientFieldBody}>
        <Text style={s.patientFieldLabel}>{label}</Text>
        <Text style={s.patientFieldValue}>{value}</Text>
      </View>
    </View>
  );
}

function PatientSection({ user }: { user: { nik?: string | null; nama?: string | null; noHp?: string | null } }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>DATA PASIEN</Text>
      <View style={s.patientCard}>
        <PatientDataField
          icon="card-outline"
          label="NIK"
          value={user.nik || '-'}
        />
        <View style={s.patientDivider} />
        <PatientDataField
          icon="person-outline"
          label="Nama Lengkap"
          value={user.nama || '-'}
        />
        <View style={s.patientDivider} />
        <PatientDataField
          icon="call-outline"
          label="Nomor Hp"
          value={user.noHp || '-'}
        />
      </View>
    </View>
  );
}

export function AppointmentScreen() {
  const {
    showConfirm,
    setShowConfirm,
    user,
    poliName,
    dateLabel,
    queueCount,
    estWait,
    isClosed,
    control,
    errors,
    onSubmit,
    handleConfirm,
  } = useAppointment();

  return (
    <SafeAreaView style={s.safeArea}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.flex}>
          <BackHeader />

          <ScrollView
            style={s.flex}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <SummaryCard poliName={poliName} dateLabel={dateLabel} queueCount={queueCount} estWait={estWait} />
            <PatientSection user={user ?? {}} />

            <View style={s.section}>
              <Text style={s.sectionTitle}>KELUHAN</Text>
              <View
                style={[
                  s.textareaWrap,
                  errors.keluhan && s.textareaError,
                ]}
              >
                <View style={s.textareaHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={C.textMuted}
                  />
                </View>
                <Controller
                  control={control}
                  name="keluhan"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={s.textarea}
                      placeholder="Contoh : Demam , Batuk , Pilek Sejak 3 Hari Lalu"
                      placeholderTextColor={C.textMuted}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      multiline
                      textAlignVertical="top"
                    />
                  )}
                />
              </View>
              {errors.keluhan && (
                <Text style={s.errorText}>{errors.keluhan.message}</Text>
              )}
            </View>

            <View style={s.actions}>
              {isClosed && (
                <View style={s.closedWarning}>
                  <Ionicons name="alert-circle-outline" size={16} color={C.danger} />
                  <Text style={s.closedWarningText}>Puskesmas sudah tutup. Booking tidak tersedia untuk hari ini.</Text>
                </View>
              )}

              <TouchableOpacity
                style={[s.confirmBtn, isClosed && s.confirmDisabled]}
                onPress={isClosed ? undefined : onSubmit}
                activeOpacity={0.85}
                disabled={isClosed}
              >
                <Ionicons
                  name="share-outline"
                  size={18}
                  color={isClosed ? C.textMuted : '#fff'}
                />
                <Text style={[s.confirmText, isClosed && s.confirmTextDisabled]}>Konfirmasi Antrean</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.cancelBtn}
                activeOpacity={0.85}
              >
                <Text style={s.cancelText}>Batalkan Antrean</Text>
              </TouchableOpacity>
            </View>

            <View style={s.spacer} />
          </ScrollView>

          <ConfirmModal
            visible={showConfirm}
            title="Apakah anda yakin untuk mengonfirmasi antrean?"
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
          />

          <BottomNav />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.background },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  backHeader: {
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
  summaryBadge: {
    backgroundColor: C.successBg,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.successText,
    letterSpacing: 0.5,
  },
  summaryPoli: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 14,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryGridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryGridDivider: {
    width: 1,
    height: 24,
    backgroundColor: C.border,
    marginHorizontal: 8,
  },
  summaryGridText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textSecondary,
    flexShrink: 1,
  },

  queuePositionWrap: {
    marginTop: 14,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  queuePositionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queuePositionLabel: {
    fontSize: 12,
    color: '#9a3412',
  },
  queuePositionBold: {
    fontWeight: '700',
  },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: C.primary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  patientCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  patientField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  patientIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientFieldBody: { flex: 1, gap: 2 },
  patientFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textMuted,
  },
  patientFieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  patientDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 70,
  },

  textareaWrap: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    padding: 14,
    minHeight: 130,
  },
  textareaError: { borderColor: '#dc2626' },
  textareaHeader: { marginBottom: 8 },
  textarea: {
    fontSize: 14,
    color: C.text,
    lineHeight: 20,
    minHeight: 80,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 6,
  },

  actions: { paddingHorizontal: 20, marginTop: 28, gap: 12 },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    gap: 8,
  },
  confirmDisabled: { backgroundColor: C.disabledBg },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  confirmTextDisabled: { color: C.disabledText },

  closedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.dangerBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  closedWarningText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.danger,
    flex: 1,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    height: 50,
    borderWidth: 1.5,
    borderColor: C.danger,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: C.danger },

  spacer: { height: 20 },
});

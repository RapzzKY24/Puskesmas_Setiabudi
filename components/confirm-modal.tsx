import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const C = {
  primary: '#0d9488',
  primaryBg: '#ccfbf1',
  text: '#0f172a',
  textSecondary: '#475569',
  danger: '#ef4444',
  overlay: 'rgba(0,0,0,0.45)',
  card: '#ffffff',
};

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmModal({
  visible,
  title,
  onConfirm,
  onCancel,
  confirmLabel = 'Ya',
  cancelLabel = 'Tidak',
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={s.overlay} onPress={onCancel}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={s.dialog}
        >
          <Pressable onPress={() => {}}>
            <View style={s.iconCircle}>
              <Ionicons name="help-circle-outline" size={36} color={C.primary} />
            </View>
            <Text style={s.title}>{title}</Text>
            <View style={s.actions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={s.cancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmBtn}
                onPress={onConfirm}
                activeOpacity={0.85}
              >
                <Text style={s.confirmText}>{confirmLabel}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  dialog: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: C.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: C.danger,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.danger,
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

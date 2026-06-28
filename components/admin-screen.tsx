import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BottomNav } from './bottom-nav';
import { api } from '@/lib/api';
import type { Poli, Antrean } from '@/types/api';

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
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  waitingBg: '#fef3c7',
  waitingText: '#92400e',
  infoBg: '#e0f2fe',
  infoText: '#0369a1',
};

type AdminTab = 'antrean' | 'poli';

const STATUS_MAP = [
  { key: 'WAITING', label: 'Menunggu', color: C.waitingText, bg: C.waitingBg },
  { key: 'CALLED', label: 'Dipanggil', color: C.infoText, bg: C.infoBg },
  { key: 'IN_SERVICE', label: 'Dilayani', color: C.successText, bg: C.successBg },
] as const;

function TopBar() {
  return (
    <View style={s.topBar}>
      <Text style={s.headerTitle}>ADMIN DASHBOARD</Text>
    </View>
  );
}

function TabSelector({ active, onSelect }: { active: AdminTab; onSelect: (t: AdminTab) => void }) {
  return (
    <View style={s.tabRow}>
      {([
        { key: 'antrean' as const, label: 'Antrean', icon: 'list-outline' },
        { key: 'poli' as const, label: 'Kelola Poli', icon: 'medical-outline' },
      ]).map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[s.tabBtn, active === tab.key && s.tabBtnActive]}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={tab.icon as any}
            size={16}
            color={active === tab.key ? C.primary : C.textMuted}
          />
          <Text style={[s.tabLabel, active === tab.key && s.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function AntreanCard({
  item,
  onUpdateStatus,
}: {
  item: Antrean & { user?: { nama?: string | null; nik?: string | null } };
  onUpdateStatus: (id: string, status: string, appointmentId?: string | null) => void;
}) {
  const statusInfo = STATUS_MAP.find((s) => s.key === item.status) ?? STATUS_MAP[0];
  const nextStatus =
    item.status === 'WAITING' ? 'CALLED' :
    item.status === 'CALLED' ? 'IN_SERVICE' :
    item.status === 'IN_SERVICE' ? 'COMPLETED' : null;

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} style={s.antreanCard}>
      <View style={s.antreanCardTop}>
        <Text style={s.antreanNomor}>{item.nomor}</Text>
        <View style={[s.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[s.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>
      <Text style={s.antreanPoli}>{item.poli?.name}</Text>
      {item.user && (
        <View style={s.antreanUser}>
          <Ionicons name="person-outline" size={14} color={C.textMuted} />
          <Text style={s.antreanUserName}>{item.user.nama || '-'}</Text>
          <Text style={s.antreanUserNik}>NIK: {item.user.nik || '-'}</Text>
        </View>
      )}
      {nextStatus && (
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => onUpdateStatus(item.id, nextStatus, item.appointmentId)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={
              nextStatus === 'CALLED' ? 'megaphone-outline' :
              nextStatus === 'IN_SERVICE' ? 'medkit-outline' :
              'checkmark-circle-outline'
            }
            size={16} color="#fff"
          />
          <Text style={s.actionBtnText}>
            {nextStatus === 'CALLED' ? 'Panggil' :
             nextStatus === 'IN_SERVICE' ? 'Layani' :
             'Selesai'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

function EResumeModal({
  visible,
  appointmentId,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  appointmentId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [diagnosa, setDiagnosa] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [obatList, setObatList] = useState<{ name: string; rule: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!visible) return;
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, [visible]);

  const addObat = () => setObatList([...obatList, { name: '', rule: '' }]);
  const removeObat = (idx: number) => setObatList(obatList.filter((_, i) => i !== idx));
  const updateObat = (idx: number, field: 'name' | 'rule', value: string) => {
    const list = [...obatList];
    list[idx] = { ...list[idx], [field]: value };
    setObatList(list);
  };

  const resetForm = () => {
    setDiagnosa('');
    setDeskripsi('');
    setObatList([]);
  };

  const handleSubmit = async () => {
    if (!appointmentId) return;
    setSubmitting(true);
    try {
      await api.post('/api/e-resume', {
        appointmentId,
        diagnosa,
        deskripsi,
        obat: obatList.filter((o) => o.name.trim()),
      });
      resetForm();
      onSuccess();
      onClose();
    } catch {
      Alert.alert('Gagal', 'Gagal membuat e-resume');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={s.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Buat E-Resume</Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <Ionicons name="close-outline" size={24} color={C.textMuted} />
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollRef}
            style={s.modalBody}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={s.modalLabel}>Diagnosa</Text>
            <TextInput
              style={s.input}
              placeholder="Diagnosa"
              value={diagnosa}
              onChangeText={setDiagnosa}
              returnKeyType="next"
            />
            <Text style={s.modalLabel}>Deskripsi</Text>
            <TextInput
              style={s.input}
              placeholder="Deskripsi / catatan"
              value={deskripsi}
              onChangeText={setDeskripsi}
              returnKeyType="done"
            />
            <Text style={s.modalLabel}>Resep Obat</Text>
            {obatList.map((obat, idx) => (
              <View key={idx} style={s.obatRow}>
                <View style={s.obatRowFields}>
                  <TextInput
                    style={[s.input, s.obatInput]}
                    placeholder="Nama obat"
                    value={obat.name}
                    onChangeText={(v) => updateObat(idx, 'name', v)}
                  />
                  <TextInput
                    style={[s.input, s.obatInput]}
                    placeholder="Aturan pakai"
                    value={obat.rule}
                    onChangeText={(v) => updateObat(idx, 'rule', v)}
                  />
                </View>
                <TouchableOpacity onPress={() => removeObat(idx)} style={s.obatRemove}>
                  <Ionicons name="trash-outline" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={s.addObatBtn} onPress={addObat} activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={18} color={C.primary} />
              <Text style={s.addObatBtnText}>Tambah Obat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.submitBtn, submitting && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={s.submitBtnText}>Simpan E-Resume</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AntreanTab() {
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [selectedPoli, setSelectedPoli] = useState<string>('');
  const [antreanList, setAntreanList] = useState<(Antrean & { user?: { nama?: string | null; nik?: string | null } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalAppointmentId, setModalAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Poli[]>('/api/poli?all=true').then((res) => {
      const poli = res.data;
      setPoliList(poli);
      if (poli.length > 0 && !selectedPoli) setSelectedPoli(poli[0].id);
    });
  }, []);

  const fetchAntrean = useCallback(async () => {
    if (!selectedPoli) return;
    setLoading(true);
    try {
      const res = await api.get<(Antrean & { user?: { nama?: string | null; nik?: string | null } })[]>('/api/antrean', {
        params: { poliId: selectedPoli },
      });
      setAntreanList(res.data);
    } catch {
      setAntreanList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPoli]);

  useEffect(() => {
    fetchAntrean();
  }, [fetchAntrean]);

  const handleUpdateStatus = useCallback(async (id: string, status: string, appointmentId?: string | null) => {
    try {
      await api.patch(`/api/antrean/${id}/status`, { status });
      if (status === 'COMPLETED' && appointmentId) {
        setModalAppointmentId(appointmentId);
      }
      fetchAntrean();
    } catch {
      Alert.alert('Gagal', 'Gagal mengubah status antrean');
    }
  }, [fetchAntrean]);

  return (
    <View style={s.tabContent}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.poliScroll}>
        {poliList.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[s.poliChip, selectedPoli === p.id && s.poliChipActive]}
            onPress={() => setSelectedPoli(p.id)}
            activeOpacity={0.8}
          >
            <Text style={[s.poliChipText, selectedPoli === p.id && s.poliChipTextActive]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={C.primary} style={s.loading} />
      ) : antreanList.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="checkmark-circle-outline" size={48} color={C.successText} />
          <Text style={s.emptyText}>Tidak ada antrean aktif</Text>
        </View>
      ) : (
        <ScrollView style={s.flex} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
          {antreanList.map((a) => (
            <AntreanCard key={a.id} item={a} onUpdateStatus={handleUpdateStatus} />
          ))}
        </ScrollView>
      )}

      <EResumeModal
        visible={modalAppointmentId !== null}
        appointmentId={modalAppointmentId}
        onClose={() => setModalAppointmentId(null)}
        onSuccess={() => fetchAntrean()}
      />
    </View>
  );
}

function PoliTab() {
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: '', name: '', icon: 'medical-outline', iconBg: '#dcfce7',
    desc: '', lokasi: '', estWait: 15,
  });

  const fetchPoli = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Poli[]>('/api/poli?all=true');
      setPoliList(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPoli(); }, [fetchPoli]);

  const resetForm = () => {
    setForm({ code: '', name: '', icon: 'medical-outline', iconBg: '#dcfce7', desc: '', lokasi: '', estWait: 15 });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (p: Poli) => {
    setForm({ code: p.code, name: p.name, icon: p.icon, iconBg: p.iconBg, desc: p.desc, lokasi: p.lokasi || '', estWait: p.estWait });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      Alert.alert('Lengkapi data', 'Nama dan kode poli wajib diisi');
      return;
    }
    try {
      if (editId) {
        await api.patch(`/api/poli/${editId}`, form);
      } else {
        await api.post('/api/poli', form);
      }
      resetForm();
      fetchPoli();
    } catch {
      Alert.alert('Gagal', 'Gagal menyimpan poli');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Poli', 'Yakin ingin menonaktifkan poli ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/api/poli/${id}`);
          fetchPoli();
        } catch {
          Alert.alert('Gagal', 'Gagal menghapus poli');
        }
      }},
    ]);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={C.primary} style={s.loading} />;
  }

  return (
    <View style={s.tabContent}>
      <ScrollView style={s.flex} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {poliList.map((p, idx) => (
          <Animated.View key={p.id} entering={FadeInDown.duration(300).delay(idx * 60).springify()} style={s.poliCard}>
            <View style={s.poliCardLeft}>
              <View style={[s.poliIcon, { backgroundColor: p.iconBg }]}>
                <Ionicons name={p.icon as any} size={20} color={C.primaryDark} />
              </View>
              <View style={s.poliCardBody}>
                <Text style={s.poliCardName}>{p.name}</Text>
                <Text style={s.poliCardCode}>{p.code} · {p.estWait} menit</Text>
              </View>
            </View>
            <View style={s.poliCardRight}>
              {!p.active && <Text style={s.inactiveLabel}>Nonaktif</Text>}
              <TouchableOpacity onPress={() => handleEdit(p)} style={s.iconBtn}>
                <Ionicons name="create-outline" size={18} color={C.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(p.id)} style={s.iconBtn}>
                <Ionicons name="trash-outline" size={18} color={C.danger} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}

        {showForm && (
          <Animated.View entering={FadeInDown.duration(300).springify()} style={s.formCard}>
            <Text style={s.formTitle}>{editId ? 'Edit Poli' : 'Tambah Poli'}</Text>
            <TextInput style={s.input} placeholder="Kode (umum, gigi...)" value={form.code} onChangeText={(v) => setForm({ ...form, code: v.toLowerCase() })} />
            <TextInput style={s.input} placeholder="Nama Poli" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            <TextInput style={s.input} placeholder="Deskripsi" value={form.desc} onChangeText={(v) => setForm({ ...form, desc: v })} />
            <TextInput style={s.input} placeholder="Lokasi (opsional)" value={form.lokasi} onChangeText={(v) => setForm({ ...form, lokasi: v })} />
            <TextInput style={s.input} placeholder="Estimasi (menit)" value={String(form.estWait)} onChangeText={(v) => setForm({ ...form, estWait: Number(v) || 0 })} keyboardType="number-pad" />
            <View style={s.formActions}>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                <Text style={s.saveBtnText}>{editId ? 'Simpan' : 'Tambah'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelFormBtn} onPress={resetForm} activeOpacity={0.85}>
                <Text style={s.cancelFormText}>Batal</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {!showForm && (
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={C.primary} />
            <Text style={s.addBtnText}>Tambah Poli</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

export function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('antrean');

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.flex}>
        <TopBar />
        <TabSelector active={activeTab} onSelect={setActiveTab} />
        {activeTab === 'antrean' ? <AntreanTab /> : <PoliTab />}
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  flex: { flex: 1 },

  topBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 12,
    backgroundColor: C.card,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.primary, letterSpacing: 0.6 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, backgroundColor: C.card, paddingBottom: 12 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, backgroundColor: C.inputBg },
  tabBtnActive: { backgroundColor: C.primaryBg },
  tabLabel: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  tabLabelActive: { color: C.primary, fontWeight: '700' },

  tabContent: { flex: 1 },
  loading: { marginTop: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: C.textMuted },

  poliScroll: { paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  poliChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, marginHorizontal: 4 },
  poliChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  poliChipText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  poliChipTextActive: { color: '#fff' },

  listContent: { paddingHorizontal: 20, paddingBottom: 20 },

  antreanCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  antreanCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  antreanNomor: { fontSize: 22, fontWeight: '800', color: C.primary },
  statusBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  antreanPoli: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 6 },
  antreanUser: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  antreanUserName: { fontSize: 13, fontWeight: '600', color: C.text },
  antreanUserNik: { fontSize: 12, color: C.textMuted },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 12, height: 42, gap: 6,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  poliCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  poliCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  poliIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  poliCardBody: { gap: 2 },
  poliCardName: { fontSize: 15, fontWeight: '600', color: C.text },
  poliCardCode: { fontSize: 12, color: C.textMuted },
  poliCardRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  inactiveLabel: { fontSize: 11, fontWeight: '700', color: C.danger, backgroundColor: C.dangerBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  iconBtn: { padding: 6 },

  formCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  formTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14 },
  input: { backgroundColor: C.inputBg, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, height: 46, fontSize: 14, color: C.text, marginBottom: 10 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  saveBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cancelFormBtn: { flex: 1, backgroundColor: C.card, borderRadius: 12, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  cancelFormText: { fontSize: 15, fontWeight: '600', color: C.textSecondary },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: C.primary, borderStyle: 'dashed' },
  addBtnText: { fontSize: 15, fontWeight: '600', color: C.primary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: C.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: 8,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.text },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: C.textSecondary, marginBottom: 6, marginTop: 4 },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  obatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  obatRowFields: { flex: 1, gap: 6 },
  obatInput: { marginBottom: 0 },
  obatRemove: { padding: 8 },
  addObatBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, marginBottom: 16 },
  addObatBtnText: { fontSize: 14, fontWeight: '600', color: C.primary },
  submitBtn: { backgroundColor: C.primary, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

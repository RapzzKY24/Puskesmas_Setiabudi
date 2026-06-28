import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';
import { api } from '@/lib/api';
import type { Poli, Antrean } from '@/types/api';

export type AdminTab = 'antrean' | 'poli';

export type AntreanWithUser = Antrean & { user?: { nama?: string | null; nik?: string | null } };

export function useAdmin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('antrean');
  return { activeTab, setActiveTab };
}

export function useAntreanTab() {
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [selectedPoli, setSelectedPoli] = useState<string>('');
  const [antreanList, setAntreanList] = useState<AntreanWithUser[]>([]);
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
      const res = await api.get<AntreanWithUser[]>('/api/antrean', {
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

  const refetchAntrean = fetchAntrean;

  return {
    poliList,
    selectedPoli,
    setSelectedPoli,
    antreanList,
    loading,
    modalAppointmentId,
    setModalAppointmentId,
    handleUpdateStatus,
    refetchAntrean,
  };
}

export function usePoliTab() {
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

  return {
    poliList, showForm, editId, loading, form,
    setForm, setShowForm, handleEdit, handleSave, handleDelete, resetForm,
  };
}

export function useEResumeModal() {
  const [diagnosa, setDiagnosa] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [obatList, setObatList] = useState<{ name: string; rule: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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

  const handleSubmit = async (appointmentId: string, onSuccess: () => void, onClose: () => void) => {
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

  return {
    diagnosa, setDiagnosa,
    deskripsi, setDeskripsi,
    obatList, submitting,
    scrollRef, addObat, removeObat, updateObat, resetForm, handleSubmit,
  };
}

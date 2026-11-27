import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Alert, Modal, Linking } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchSupportItems, createSupportItem, deleteSupportItem } from '@/services/adminService';

type SupportItem = {
  _id: string;
  id: string;
  title: string;
  description: string;
  kind: 'bank' | 'mobile' | 'link' | 'help' | 'other';
  details: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
};

const KIND_LABELS: Record<string, string> = {
  bank: 'Bank Transfer',
  mobile: 'Mobile Money',
  link: 'Link / Website',
  help: 'Help / Info',
  other: 'Other',
};

export const SupportScreen: React.FC = () => {
  const { admin } = useAuth();
  const [items, setItems] = useState<SupportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    kind: 'other' as SupportItem['kind'],
    title: '',
    description: '',
    details: '',
    url: ''
  });

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      setItems(await fetchSupportItems(admin));
    } catch {}
    finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try {
      await createSupportItem(admin!, form);
      setForm({ kind: 'other', title: '', description: '', details: '', url: '' });
      setShowForm(false);
      load();
      Alert.alert('Success', 'Support item created');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this support item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSupportItem(admin!, id);
            load();
            Alert.alert('Success', 'Item deleted');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed');
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Support Info</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {items.map((item) => (
          <View key={item._id || item.id} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.kindBadge}>
                <Text style={styles.kindText}>{KIND_LABELS[item.kind] || 'Other'}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
              {item.details && <Text style={styles.details}>{item.details}</Text>}
              {item.url && (
                <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
                  <Text style={styles.link}>Open Link →</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id || item.id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {items.length === 0 && <Text style={styles.empty}>No support items.</Text>}
      </ScrollView>

      {/* Create Support Item Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Support Item</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Kind</Text>
              <View style={styles.kindSelector}>
                {Object.entries(KIND_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.kindOption, form.kind === key && styles.kindOptionSelected]}
                    onPress={() => setForm({ ...form, kind: key as SupportItem['kind'] })}
                  >
                    <Text style={[styles.kindOptionText, form.kind === key && styles.kindOptionTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Title *"
                value={form.title}
                onChangeText={v => setForm({ ...form, title: v })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={form.description}
                onChangeText={v => setForm({ ...form, description: v })}
                multiline
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details (bank account, phone number, etc.)"
                value={form.details}
                onChangeText={v => setForm({ ...form, details: v })}
                multiline
              />
              <TextInput
                style={styles.input}
                placeholder="Link URL (optional)"
                value={form.url}
                onChangeText={v => setForm({ ...form, url: v })}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
                <Text style={styles.submitButtonText}>Publish</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#3590F3' },
  heading: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  addButton: { backgroundColor: '#ffffff', borderRadius: 10, padding: 12 },
  addButtonText: { color: '#3590F3', fontWeight: '700' },
  scroll: { flex: 1, padding: 16 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  cardContent: { flex: 1 },
  kindBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  kindText: { fontSize: 11, color: '#4338ca', fontWeight: '600' },
  title: { fontWeight: '700', color: '#1e293b', fontSize: 16 },
  description: { fontSize: 14, color: '#64748b', marginTop: 4 },
  details: { fontSize: 14, color: '#334155', marginTop: 4 },
  link: { color: '#2563eb', fontSize: 14, marginTop: 4, fontWeight: '600' },
  deleteButton: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  deleteButtonText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  modalClose: { fontSize: 28, color: '#64748b' },
  modalBody: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  kindSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  kindOption: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  kindOptionSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  kindOptionText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  kindOptionTextSelected: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

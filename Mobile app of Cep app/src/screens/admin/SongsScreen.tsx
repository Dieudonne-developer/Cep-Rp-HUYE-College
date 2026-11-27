import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchSongs, deleteSong } from '@/services/adminService';
import { API_BASE_URL } from '@/config/api';

export const SongsScreen: React.FC = () => {
  const { admin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    url: '',
    artist: '',
    description: '',
    mediaType: 'audio' as 'audio' | 'video',
    downloadable: false,
    category: ''
  });

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      setItems(await fetchSongs(admin));
    } catch {}
    finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      Alert.alert('Error', 'Title and URL are required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': admin?.email || '',
          'X-Admin-Group': admin?.adminGroup || '',
          'X-Admin-ID': admin?.id || ''
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        setForm({ title: '', url: '', artist: '', description: '', mediaType: 'audio', downloadable: false, category: '' });
        setShowForm(false);
        load();
        Alert.alert('Success', 'Song created');
      } else {
        Alert.alert('Error', data.message || 'Failed to create song');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Song', 'Are you sure you want to delete this song?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSong(admin!, id);
            load();
            Alert.alert('Success', 'Song deleted');
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
        <Text style={styles.heading}>Songs</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Add Song</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {items.map((item) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title || item.name || 'Song'}</Text>
              <Text style={styles.subtitle}>{item.artist || ''}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
              <Text style={styles.mediaType}>{item.mediaType === 'video' ? '🎬 Video' : '🎵 Audio'}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {items.length === 0 && <Text style={styles.empty}>No songs.</Text>}
      </ScrollView>

      {/* Create Song Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Song</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Title *"
                value={form.title}
                onChangeText={v => setForm({ ...form, title: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="URL *"
                value={form.url}
                onChangeText={v => setForm({ ...form, url: v })}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Artist"
                value={form.artist}
                onChangeText={v => setForm({ ...form, artist: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Category"
                value={form.category}
                onChangeText={v => setForm({ ...form, category: v })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={form.description}
                onChangeText={v => setForm({ ...form, description: v })}
                multiline
              />
              <TouchableOpacity
                style={styles.mediaTypeButton}
                onPress={() => setForm({ ...form, mediaType: form.mediaType === 'audio' ? 'video' : 'audio' })}
              >
                <Text style={styles.mediaTypeButtonText}>Media Type: {form.mediaType.toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.downloadableButton}
                onPress={() => setForm({ ...form, downloadable: !form.downloadable })}
              >
                <Text style={styles.downloadableButtonText}>Downloadable: {form.downloadable ? 'Yes' : 'No'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
                <Text style={styles.submitButtonText}>Save Song</Text>
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
  title: { fontWeight: '700', color: '#1e293b', fontSize: 16 },
  subtitle: { fontSize: 12, color: '#64748b', marginTop: 2 },
  description: { fontSize: 14, color: '#334155', marginTop: 4 },
  mediaType: { fontSize: 12, color: '#64748b', marginTop: 4 },
  deleteButton: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  deleteButtonText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  modalClose: { fontSize: 28, color: '#64748b' },
  modalBody: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  mediaTypeButton: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  mediaTypeButtonText: { color: '#475569', fontWeight: '600' },
  downloadableButton: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  downloadableButtonText: { color: '#475569', fontWeight: '600' },
  submitButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

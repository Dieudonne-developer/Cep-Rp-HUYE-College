import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { fetchEvents, createEvent, deleteEvent, uploadEventImage } from '@/services/adminService';

export const EventsScreen: React.FC = () => {
  const { admin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', eventTime: '', location: '', imageUrl: '' });
  
  const load = useCallback(async () => { 
    if (!admin) return; 
    setLoading(true);
    try { 
      setItems(await fetchEvents(admin)); 
    } catch {} 
    finally {
      setLoading(false);
    }
  }, [admin]);
  
  useEffect(() => { load(); }, [load]);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        try {
          const data = await uploadEventImage(admin!, result.assets[0]);
          const url = data?.url || data?.fileUrl;
          if (url) {
            setForm({ ...form, imageUrl: url });
            Alert.alert('Success', 'Image uploaded');
          } else {
            Alert.alert('Error', 'Upload did not return an image URL');
          }
        } catch (e: any) {
          Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to pick or upload image');
    } finally {
      setUploading(false);
    }
  };

  const add = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try { 
      await createEvent(admin!, { ...form, eventDate: form.eventDate || undefined }); 
      setForm({ title:'', description:'', eventDate:'', eventTime:'', location:'', imageUrl:'' }); 
      setShowForm(false); 
      load(); 
      Alert.alert('Success', 'Event created');
    }
    catch (e:any) { 
      Alert.alert('Error', e?.message || 'Failed'); 
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(admin!, id);
            load();
            Alert.alert('Success', 'Event deleted');
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
        <Text style={styles.heading}>Activities / Events</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {items.map((item) => (
          <View key={item._id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {item.location || ''} {item.eventDate || item.date ? ' • ' + new Date(item.eventDate || item.date).toLocaleDateString() : ''}
              </Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
              {item.imageUrl && <Text style={styles.imageIndicator}>📷 Image attached</Text>}
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item._id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {items.length === 0 && <Text style={styles.empty}>No events.</Text>}
      </ScrollView>

      {/* Create Event Modal */}
      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Event</Text>
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
                placeholder="Date (YYYY-MM-DD)"
                value={form.eventDate}
                onChangeText={v => setForm({ ...form, eventDate: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Time (e.g., 10:00)"
                value={form.eventTime}
                onChangeText={v => setForm({ ...form, eventTime: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={form.location}
                onChangeText={v => setForm({ ...form, location: v })}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={form.description}
                onChangeText={v => setForm({ ...form, description: v })}
                multiline
              />
              <TouchableOpacity style={styles.imageButton} onPress={handlePickImage} disabled={uploading}>
                <Text style={styles.imageButtonText}>{uploading ? 'Uploading...' : 'Choose Image'}</Text>
              </TouchableOpacity>
              {form.imageUrl && <Text style={styles.imageStatus}>Image selected</Text>}
              <TouchableOpacity style={styles.submitButton} onPress={add}>
                <Text style={styles.submitButtonText}>Save Event</Text>
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
  imageIndicator: { fontSize: 12, color: '#64748b', marginTop: 4 },
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
  imageButton: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 8 },
  imageButtonText: { color: '#475569', fontWeight: '600' },
  imageStatus: { fontSize: 12, color: '#22c55e', marginTop: 4 },
  submitButton: { backgroundColor: '#2563eb', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 }
});

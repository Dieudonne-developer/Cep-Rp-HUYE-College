import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchGlobalActivities, createGlobalActivity, deleteGlobalActivity, uploadEventImage } from '@/services/adminService';
import * as ImagePicker from 'expo-image-picker';
import { ScreenHeader } from '@/components/ScreenHeader';

export const GlobalActivitiesScreen: React.FC = () => {
  const { admin } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    imageUrl: ''
  });

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const data = await fetchGlobalActivities(admin);
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    load();
  }, [load]);

  const pickImage = async () => {
    if (!admin) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setUploading(true);
      try {
        const res = await uploadEventImage(admin, asset);
        const url = res?.url || res?.fileUrl;
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
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try {
      await createGlobalActivity(admin!, form);
      setForm({ title: '', description: '', eventDate: '', eventTime: '', location: '', imageUrl: '' });
      setShowForm(false);
      load();
      Alert.alert('Success', 'Activity created');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create activity');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Activity', 'Are you sure you want to delete this activity?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGlobalActivity(admin!, id);
            load();
            Alert.alert('Success', 'Activity deleted');
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <ScreenHeader title="Activities" />
      <Text style={styles.subheading}>Manage activities shown on the public homepage</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.createButtonText}>{showForm ? 'Close Form' : '+ Add Activity'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Title *"
            value={form.title}
            onChangeText={(v) => setForm({ ...form, title: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={form.eventDate}
            onChangeText={(v) => setForm({ ...form, eventDate: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Time (e.g., 10:00)"
            value={form.eventTime}
            onChangeText={(v) => setForm({ ...form, eventTime: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={form.location}
            onChangeText={(v) => setForm({ ...form, location: v })}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChangeText={(v) => setForm({ ...form, imageUrl: v })}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.imageButton} onPress={pickImage} disabled={uploading}>
            <Text style={styles.imageButtonText}>{uploading ? 'Uploading...' : 'Choose Image File'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
            <Text style={styles.submitButtonText}>Save Activity</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.list}>
        {activities.map((item) => (
          <View key={item._id || item.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {item.location} {item.date ? '• ' + new Date(item.date).toLocaleDateString() : ''}
              </Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id || item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {activities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySubtitle}>Add activities to appear on the homepage</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20
  },
  header: {
    marginBottom: 20
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  subheading: {
    fontSize: 16,
    color: '#64748b'
  },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  imageButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4
  },
  imageButtonText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  list: {
    gap: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardContent: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  description: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  }
});

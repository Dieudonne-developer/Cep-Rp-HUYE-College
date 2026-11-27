import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';
import { useMemberAuth } from '@/context/MemberAuthContext';

export const AbanyamugishaPrayerRequestsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, token } = useMemberAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    request: '',
    category: 'general',
    anonymous: false,
  });

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/prayer-requests?group=abanyamugisha`);
      const data = await response.json();
      setRequests(data.requests || data.data || []);
    } catch (error) {
      console.error('Failed to load prayer requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.request.trim()) {
      Alert.alert('Error', 'Please enter your prayer request');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/prayer-requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          group: 'abanyamugisha',
          userId: user?.id,
          username: user?.username,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit prayer request');
      }

      setForm({ name: '', request: '', category: 'general', anonymous: false });
      Alert.alert('Success', 'Thank you! Your prayer request was submitted.');
      load();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit prayer request');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.title}>Prayer Requests</Text>
        <Text style={styles.subtitle}>Share your prayer requests with the Abanyamugisha community.</Text>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {['general', 'healing', 'financial', 'family', 'ministry', 'other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryButton, form.category === cat && styles.categoryButtonActive]}
                  onPress={() => setForm({ ...form, category: cat })}
                >
                  <Text style={[styles.categoryButtonText, form.category === cat && styles.categoryButtonTextActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Prayer Request *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your prayer request in detail..."
              multiline
              numberOfLines={5}
              value={form.request}
              onChangeText={(text) => setForm({ ...form, request: text })}
            />
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setForm({ ...form, anonymous: !form.anonymous })}
          >
            <View style={[styles.checkbox, form.anonymous && styles.checkboxChecked]}>
              {form.anonymous && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Submit anonymously</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={busy}>
            <Text style={styles.submitButtonText}>{busy ? 'Submitting...' : 'Submit Prayer Request'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Recent Prayer Requests</Text>
          {loading ? (
            <Text style={styles.empty}>Loading...</Text>
          ) : requests.length === 0 ? (
            <Text style={styles.empty}>No prayer requests yet. Be the first to share!</Text>
          ) : (
            requests.map((req, index) => (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{req.category || 'General'}</Text>
                  </View>
                  {req.anonymous ? (
                    <Text style={styles.requestAuthor}>Anonymous</Text>
                  ) : (
                    <Text style={styles.requestAuthor}>{req.name || 'A member'}</Text>
                  )}
                </View>
                <Text style={styles.requestText}>{req.request}</Text>
                {req.createdAt && (
                  <Text style={styles.requestDate}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 80,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  formSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryButtonActive: {
    backgroundColor: '#2735F5',
    borderColor: '#2735F5',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#2735F5',
    borderColor: '#2735F5',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#334155',
  },
  submitButton: {
    backgroundColor: '#2735F5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  requestsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'capitalize',
  },
  requestAuthor: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  requestText: {
    fontSize: 15,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 8,
  },
  requestDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 20,
  },
});

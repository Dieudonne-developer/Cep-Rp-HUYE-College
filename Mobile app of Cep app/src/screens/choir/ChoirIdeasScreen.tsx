import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';

export const ChoirIdeasScreen: React.FC = () => {
  const navigation = useNavigation();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    category: 'other',
    idea: '',
    anonymous: false,
  });

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/choir/implemented-ideas`);
      const data = await response.json();
      setIdeas(data.data || []);
    } catch (error) {
      console.error('Failed to load ideas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.idea.trim()) {
      Alert.alert('Error', 'Please enter your idea');
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/choir/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit idea');
      }

      setForm({ name: '', email: '', category: 'other', idea: '', anonymous: false });
      Alert.alert('Success', 'Thank you! Your idea was submitted for review.');
      load();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit idea');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.title}>Share Your Ideas</Text>

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
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {['song', 'performance', 'event', 'improvement', 'other'].map((cat) => (
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
            <Text style={styles.label}>Your Idea *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your idea in detail..."
              multiline
              numberOfLines={5}
              value={form.idea}
              onChangeText={(text) => setForm({ ...form, idea: text })}
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
            <Text style={styles.submitButtonText}>{busy ? 'Submitting...' : 'Submit Idea'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ideasSection}>
          <Text style={styles.sectionTitle}>Recent Implemented Ideas</Text>
          {ideas.length === 0 ? (
            <Text style={styles.empty}>No implemented ideas yet.</Text>
          ) : (
            ideas.map((idea) => (
              <View key={idea._id} style={styles.ideaCard}>
                <Text style={styles.ideaText}>"{idea.idea}"</Text>
                <Text style={styles.ideaMeta}>
                  Suggested by {idea.anonymous ? 'Anonymous' : (idea.name || 'a member')}
                  {idea.implementedDate && ` • Implemented ${new Date(idea.implementedDate).toLocaleDateString()}`}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 72,
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
  ideasSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  ideaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ideaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  ideaMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 20,
  },
});

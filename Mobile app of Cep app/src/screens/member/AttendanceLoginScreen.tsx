import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';
import { useMemberAuth } from '@/context/MemberAuthContext';

const GROUPS = [
  { key: 'choir', label: 'Choir' },
  { key: 'anointed', label: 'Anointed' },
];

export const AttendanceLoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login } = useMemberAuth();
  const [form, setForm] = useState({ username: '', password: '', group: 'choir' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      await login(form.username.trim(), form.password, form.group);
      // Navigate directly to Attendance screen
      try {
        (navigation as any).navigate('Attendance');
      } catch {
        (navigation as any).navigate('Main');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error?.message || error?.toString() || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).navigate('Main')} />
      <ScrollView style={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Attendance Login</Text>
          <Text style={styles.subtitle}>Log in with the account your admin created for you.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Family</Text>
            <View style={styles.groupRow}>
              {GROUPS.map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.groupButton, form.group === g.key && styles.groupButtonActive]}
                  onPress={() => setForm({ ...form, group: g.key })}
                >
                  <Text style={[styles.groupButtonText, form.group === g.key && styles.groupButtonTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username or email"
              value={form.username}
              onChangeText={(text) => setForm({ ...form, username: text })}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  groupButtonActive: {
    backgroundColor: '#2735F5',
    borderColor: '#2735F5',
  },
  groupButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  groupButtonTextActive: {
    color: '#ffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    backgroundColor: '#2735F5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
});

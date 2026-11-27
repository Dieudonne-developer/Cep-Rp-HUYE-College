import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useMemberAuth } from '@/context/MemberAuthContext';

const GROUPS = [
  { key: 'choir', label: 'Choir' },
  { key: 'anointed', label: 'Anointed' },
];

export const MemberLoginForm: React.FC = () => {
  const { login } = useMemberAuth();
  const [loginForm, setLoginForm] = useState({ username: '', password: '', group: 'choir' });
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginForm.username.trim(), loginForm.password, loginForm.group);
    } catch (error: any) {
      Alert.alert('Login Failed', error?.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>My Attendance</Text>
        <Text style={styles.subtitle}>Log in with the account your admin created for you.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Family</Text>
          <View style={styles.groupRow}>
            {GROUPS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[styles.groupButton, loginForm.group === g.key && styles.groupButtonActive]}
                onPress={() => setLoginForm({ ...loginForm, group: g.key })}
              >
                <Text style={[styles.groupButtonText, loginForm.group === g.key && styles.groupButtonTextActive]}>
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
            value={loginForm.username}
            onChangeText={(text) => setLoginForm({ ...loginForm, username: text })}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={loginForm.password}
            onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loginLoading}
        >
          <Text style={styles.loginButtonText}>{loginLoading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: { flex: 1, justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  groupButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  groupButtonActive: { backgroundColor: '#2735F5', borderColor: '#2735F5' },
  groupButtonText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  groupButtonTextActive: { color: '#ffffff' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#ffffff' },
  loginButton: { backgroundColor: '#2735F5', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  loginButtonDisabled: { backgroundColor: '#94a3b8' },
  loginButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});

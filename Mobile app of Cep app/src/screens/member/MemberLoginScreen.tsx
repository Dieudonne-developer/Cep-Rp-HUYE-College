import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useMemberAuth } from '@/context/MemberAuthContext';

const GROUPS = [
  { key: 'choir', label: 'Ishyangaryera Choir' },
  { key: 'anointed', label: 'Anointed' },
  { key: 'cepier', label: 'CEP' },
];

export const MemberLoginScreen: React.FC = () => {
  const { login } = useMemberAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [group, setGroup] = useState('choir');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) { Alert.alert('Missing fields', 'Enter your email/username and password.'); return; }
    setBusy(true);
    try {
      await login(username.trim(), password, group);
    } catch (e: any) {
      Alert.alert('Login failed', e?.message || 'Invalid credentials');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CEP APP</Text>
        <Text style={styles.subtitle}>Member Login</Text>

        <Text style={styles.label}>Family</Text>
        <View style={styles.groupRow}>
          {GROUPS.map(g => (
            <TouchableOpacity key={g.key} style={[styles.groupBtn, group === g.key && styles.groupBtnActive]} onPress={() => setGroup(g.key)}>
              <Text style={[styles.groupBtnText, group === g.key && styles.groupBtnTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Email or Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" keyboardType="email-address" placeholder="you@gmail.com" />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
        <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
          <Text style={styles.buttonText}>{busy ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 24, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, backgroundColor: '#fff', fontSize: 15 },
  groupRow: { flexDirection: 'row', gap: 8 },
  groupBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#e2e8f0', alignItems: 'center' },
  groupBtnActive: { backgroundColor: '#2563eb' },
  groupBtnText: { fontSize: 12, color: '#334155', fontWeight: '600' },
  groupBtnTextActive: { color: '#fff' },
  button: { marginTop: 24, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

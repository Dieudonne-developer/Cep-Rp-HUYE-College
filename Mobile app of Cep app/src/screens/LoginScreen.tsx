import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_ADMIN_GROUP } from '@/config/api';

const GROUPS = [
  { key: 'cepier', label: 'CEP' },
  { key: 'choir', label: 'Ishyangaryera Choir' },
  { key: 'anointed', label: 'Anointed' },
  { key: 'abanyamugisha', label: 'Abanyamugisha' },
  { key: 'psalm23', label: 'Psalm 23' },
  { key: 'psalm46', label: 'Psalm 46' },
  { key: 'protocol', label: 'Protocol' },
  { key: 'social', label: 'Social' },
  { key: 'evangelical', label: 'Evangelical' },
];

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminGroup, setAdminGroup] = useState(DEFAULT_ADMIN_GROUP || 'choir');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await login({ email, password, adminGroup });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>CEP RP Huye</Text>
        <Text style={styles.subtitle}>Admin Login — all family groups</Text>

        <Text style={styles.label}>Your Family / Group</Text>
        <View style={styles.groupWrap}>
          {GROUPS.map(g => (
            <TouchableOpacity
              key={g.key}
              style={[styles.groupChip, adminGroup === g.key && styles.groupChipActive]}
              onPress={() => setAdminGroup(g.key)}
            >
              <Text style={[styles.groupChipText, adminGroup === g.key && styles.groupChipTextActive]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="admin@cep.com" />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={[styles.button, isSubmitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 24, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, backgroundColor: '#fff', fontSize: 15 },
  groupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  groupChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 16, backgroundColor: '#e2e8f0' },
  groupChipActive: { backgroundColor: '#2563eb' },
  groupChipText: { fontSize: 11, color: '#334155', fontWeight: '600' },
  groupChipTextActive: { color: '#fff' },
  error: { color: '#dc2626', marginTop: 12, fontSize: 13 },
  button: { marginTop: 24, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

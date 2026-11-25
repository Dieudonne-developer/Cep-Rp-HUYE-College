import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>CEP RP HUYE COLLEGE</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.loginTitle}>LOGIN</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
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

            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forget your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>{isSubmitting ? 'Signing in...' : 'LOGIN'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  headerSection: {
    backgroundColor: '#3b82f6',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#ffffff',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 24,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 14 },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  groupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  groupChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  groupChipActive: { backgroundColor: '#3b82f6' },
  groupChipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  groupChipTextActive: { color: '#ffffff' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#f9fafb',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#3b82f6',
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});

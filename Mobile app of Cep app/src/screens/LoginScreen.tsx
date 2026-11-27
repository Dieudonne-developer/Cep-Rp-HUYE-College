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

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="example@email.com"
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
  flex: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  headerSection: {
    backgroundColor: '#3b82f6',
    paddingVertical: 50,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#ffffff',
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 30,
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
  form: { gap: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  groupWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  groupChipActive: { backgroundColor: '#3b82f6' },
  groupChipText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  groupChipTextActive: { color: '#ffffff' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    backgroundColor: '#f9fafb',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});

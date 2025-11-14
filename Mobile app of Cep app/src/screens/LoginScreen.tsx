import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_ADMIN_GROUP } from '@/config/api';

const presetAccounts = [
  { label: 'Super Admin', email: 'superadmin@cep.com', password: 'SuperAdmin@2024' },
  { label: 'All Groups Admin', email: 'admin@cep.com', password: 'admin123' },
  { label: 'Choir', email: 'choir@cep.com', password: 'choir123' },
  { label: 'Anointed', email: 'anointed@cep.com', password: 'anointed123' },
  { label: 'Abanyamugisha', email: 'abanyamugisha@cep.com', password: 'abanyamugisha123' },
  { label: 'Psalm 23', email: 'psalm23@cep.com', password: 'psalm23123' },
  { label: 'Psalm 46', email: 'psalm46@cep.com', password: 'psalm46123' },
  { label: 'Protocol', email: 'protocol@cep.com', password: 'protocol123' },
  { label: 'Social', email: 'social@cep.com', password: 'social123' },
  { label: 'Evangelical', email: 'evangelical@cep.com', password: 'evangelical123' }
];

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      await login({ email, password, adminGroup: DEFAULT_ADMIN_GROUP });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreset = (presetEmail: string, presetPassword: string) => {
    setEmail(presetEmail);
    setPassword(presetPassword);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CEP Admin Mobile</Text>
        <Text style={styles.subtitle}>
          Sign in with your administrator account to manage members, events and ideas on the go.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@cep.com"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[styles.button, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Signing in…' : 'Sign In'}</Text>
          </Pressable>
        </View>

        <View style={styles.presets}>
          <Text style={styles.presetTitle}>Quick credentials</Text>
          {presetAccounts.map((preset) => (
            <Pressable
              key={preset.email}
              style={styles.presetItem}
              onPress={() => handlePreset(preset.email, preset.password)}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
              <Text style={styles.presetValue}>{preset.email}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
    backgroundColor: '#0f172a'
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center'
  },
  subtitle: {
    color: '#cbd5f5',
    textAlign: 'center',
    marginTop: 12
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 12,
    borderRadius: 12,
    marginTop: 24
  },
  form: {
    marginTop: 32,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    gap: 8
  },
  label: {
    color: '#cbd5f5',
    fontSize: 14,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155'
  },
  button: {
    marginTop: 24,
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center'
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700'
  },
  presets: {
    marginTop: 32,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 12
  },
  presetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  presetItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  presetLabel: {
    fontWeight: '600',
    color: '#0f172a'
  },
  presetValue: {
    color: '#475569'
  }
});



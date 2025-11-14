import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { apiClient } from '@/services/apiClient';

export const SettingsScreen: React.FC = () => {
  const { admin, logout } = useAuth();
  const [healthStatus, setHealthStatus] = React.useState<string>('Unknown');

  const checkHealth = async () => {
    try {
      const response = await apiClient.get('/health');
      setHealthStatus(response.data?.status ?? 'ok');
    } catch (error) {
      setHealthStatus('unreachable');
    }
  };

  React.useEffect(() => {
    checkHealth();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Do you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subheading}>Manage your account and environment.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.value}>{admin?.username}</Text>
        <Text style={styles.meta}>{admin?.email}</Text>
        <Text style={styles.meta}>Role: {admin?.role}</Text>
        <Text style={styles.meta}>Group: {admin?.adminGroup}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Backend API</Text>
        <Text style={styles.value}>{API_BASE_URL}</Text>
        <Text style={[styles.meta, { marginTop: 8 }]}>Health: {healthStatus}</Text>
        <Pressable style={styles.secondaryButton} onPress={checkHealth}>
          <Text style={styles.secondaryButtonText}>Re-check status</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subheading: {
    color: '#475569'
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4
  },
  label: {
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#94a3b8'
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  meta: {
    color: '#475569'
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontWeight: '600',
    color: '#0f172a'
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 'auto'
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  }
});



import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemberAuth } from '@/context/MemberAuthContext';

export const SettingsScreen: React.FC = () => {
  const { user, logout } = useMemberAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.username || 'Member'}</Text>
        <Text style={styles.meta}>{user?.email}</Text>
        <Text style={styles.meta}>Family: {user?.userGroup || '—'}</Text>
      </View>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  name: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 13, color: '#64748b', marginTop: 4 },
  logout: { marginTop: 24, backgroundColor: '#dc2626', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

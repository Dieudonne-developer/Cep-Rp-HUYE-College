import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { fetchMyAttendance } from '@/services/userService';

const STATUS_COLORS: Record<string, string> = { present: '#16a34a', absent: '#dc2626', late: '#d97706' };
const GROUPS = [
  { key: 'choir', label: 'Choir' },
  { key: 'anointed', label: 'Anointed' },
];

export const AttendanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const { token, user, logout, login } = useMemberAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '', group: 'choir' });
  const [loginLoading, setLoginLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchMyAttendance(token);
      setRecords(Array.isArray(data) ? data : (data?.records || []));
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoginLoading(true);
    try {
      await login(loginForm.username.trim(), loginForm.password, loginForm.group);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (!token) {
    return (
      <View style={styles.container}>
        <AppHeader onMenuPress={() => (navigation as any).getParent()?.openDrawer?.() || (navigation as any).openDrawer?.()} />
        <ScrollView contentContainerStyle={styles.loginScroll}>
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
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).getParent()?.openDrawer?.() || (navigation as any).openDrawer?.()} />
      <View style={styles.header}>
        <Text style={styles.title}>My Attendance</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      {user && (
        <Text style={styles.userInfo}>Logged in as: {user.username || user.email}</Text>
      )}
      <FlatList
        data={records}
        keyExtractor={(r, i) => String(r.id || r.session_id || i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>{loading ? 'Loading...' : 'No attendance records yet.'}</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.session}>{item.session_title || item.title || 'Session'}</Text>
              <Text style={styles.meta}>{item.session_date ? new Date(item.session_date).toLocaleDateString() : ''}{item.session_group ? ` • ${item.session_group}` : ''}</Text>
              {item.reason ? <Text style={styles.reason}>Reason: {item.reason}</Text> : null}
            </View>
            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || '#64748b' }]}>
              <Text style={styles.badgeText}>{String(item.status || '').toUpperCase()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  logoutButton: { backgroundColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  logoutButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  userInfo: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  session: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  reason: { fontSize: 12, color: '#92400e', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
  loginScroll: { flexGrow: 1, justifyContent: 'flex-start', paddingTop: 8 },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginText: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  loginButton: { backgroundColor: '#2735F5', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  loginButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loginButtonDisabled: { backgroundColor: '#94a3b8' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  groupButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  groupButtonActive: { backgroundColor: '#2735F5', borderColor: '#2735F5' },
  groupButtonText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  groupButtonTextActive: { color: '#ffffff' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#ffffff' },
});

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { MemberLoginForm } from '@/components/MemberLoginForm';
import { API_BASE_URL } from '@/config/api';

export const ChoirAttendanceScreen: React.FC = () => {
  
  const navigation = useNavigation();
  const { user, token, logout } = useMemberAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/api/attendance/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const list = Array.isArray(data?.attendance) ? data.attendance : Array.isArray(data?.records) ? data.records : Array.isArray(data) ? data : [];
      setAttendance(list);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <View style={styles.header}>
        <Text style={styles.title}>My Attendance</Text>
        {token && (
          <TouchableOpacity style={styles.logoutButton} onPress={() => {
            Alert.alert('Logout', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: logout },
            ]);
          }}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
      {user && token && (
        <Text style={styles.userInfo}>Logged in as: {user.username || user.email}</Text>
      )}

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {loading ? (
          <Text style={styles.empty}>Loading...</Text>
        ) : !token ? (
          <MemberLoginForm />
        ) : !Array.isArray(attendance) || attendance.length === 0 ? (
          <Text style={styles.empty}>No attendance records found.</Text>
        ) : (
          attendance.map((record, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{record.session_title || record.eventTitle || record.event || 'Session'}</Text>
                <View style={[styles.statusBadge, (record.status === 'present' || record.present) ? styles.statusPresent : record.status === 'late' ? styles.statusLate : styles.statusAbsent]}>
                  <Text style={styles.statusText}>{String(record.status || (record.present ? 'present' : 'absent')).toUpperCase()}</Text>
                </View>
              </View>
              {(record.session_date || record.date) && (
                <Text style={styles.cardMeta}>
                  {new Date(record.session_date || record.date).toLocaleDateString()}
                </Text>
              )}
              {(record.session_time || record.time) && (
                <Text style={styles.cardMeta}>{record.session_time || record.time}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfo: {
    fontSize: 13,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusPresent: {
    backgroundColor: '#dcfce7',
  },
  statusAbsent: {
    backgroundColor: '#fee2e2',
  },
  statusLate: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  cardMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#2735F5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

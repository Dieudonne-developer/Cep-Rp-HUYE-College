import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useMemberAuth } from '@/context/MemberAuthContext';
import { fetchMyAttendance } from '@/services/userService';

const STATUS_COLORS: Record<string, string> = { present: '#16a34a', absent: '#dc2626', late: '#d97706' };

export const AttendanceScreen: React.FC = () => {
  const { token } = useMemberAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchMyAttendance(token);
      setRecords(Array.isArray(data) ? data : (data?.records || []));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Attendance</Text>
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
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  session: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  reason: { fontSize: 12, color: '#92400e', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 40 },
});

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { StatusCard } from '@/components/StatusCard';
import { fetchSuperAdmins } from '@/services/adminService';
import { ScreenHeader } from '@/components/ScreenHeader';

type Stats = {
  totalAdmins: number;
  activeAdmins: number;
  suspendedAdmins: number;
  superAdmins: number;
  adminsByGroup: Record<string, number>;
};

const GROUP_LABELS: Record<string, string> = {
  'choir': 'Choir',
  'anointed': 'Anointed',
  'abanyamugisha': 'Abanyamugisha',
  'psalm23': 'Psalm 23',
  'psalm46': 'Psalm 46',
  'protocol': 'Protocol',
  'social': 'Social',
  'evangelical': 'Evangelical',
  'cepier': 'CEP'
};

export const SuperAdminDashboardScreen: React.FC = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAdmins: 0,
    activeAdmins: 0,
    suspendedAdmins: 0,
    superAdmins: 0,
    adminsByGroup: {}
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!admin) return;
    try {
      const admins = await fetchSuperAdmins(admin);
      const totalAdmins = admins.length;
      const activeAdmins = admins.filter((a: any) => a.isApproved).length;
      const suspendedAdmins = admins.filter((a: any) => !a.isApproved).length;
      const superAdmins = admins.filter((a: any) => a.role === 'super-admin').length;
      
      const adminsByGroup: Record<string, number> = {};
      admins.forEach((admin: any) => {
        const group = admin.adminGroup || 'unknown';
        adminsByGroup[group] = (adminsByGroup[group] || 0) + 1;
      });

      setStats({
        totalAdmins,
        activeAdmins,
        suspendedAdmins,
        superAdmins,
        adminsByGroup
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
    >
      <ScreenHeader title="Dashboard" />
      <Text style={styles.subheading}>Manage all administrators across the CEP system</Text>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatusCard label="Total Admins" value={stats.totalAdmins} accentColor="#2563eb" />
        <StatusCard label="Active Admins" value={stats.activeAdmins} accentColor="#22c55e" />
      </View>

      <View style={styles.statsGrid}>
        <StatusCard label="Suspended Admins" value={stats.suspendedAdmins} accentColor="#dc2626" />
        <StatusCard label="Super Admins" value={stats.superAdmins} accentColor="#a855f7" />
      </View>

      {/* Admins by Group */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admins by Group</Text>
        <View style={styles.groupGrid}>
          {Object.entries(stats.adminsByGroup).map(([group, count]) => (
            <View key={group} style={styles.groupCard}>
              <Text style={styles.groupCount}>{count}</Text>
              <Text style={styles.groupLabel}>{GROUP_LABELS[group] || group}</Text>
            </View>
          ))}
          {Object.keys(stats.adminsByGroup).length === 0 && (
            <Text style={styles.emptyText}>No admin groups found</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20
  },
  header: {
    marginBottom: 24
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8
  },
  subheading: {
    fontSize: 16,
    color: '#64748b'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  groupCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  groupCount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a'
  },
  groupLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 16
  }
});

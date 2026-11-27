import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboard } from '@/services/adminService';
import { StatusCard } from '@/components/StatusCard';
import { ScreenHeader } from '@/components/ScreenHeader';

export const DashboardScreen: React.FC = () => {
  const { admin } = useAuth();

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', admin?.adminGroup],
    queryFn: () => fetchDashboard(admin!),
    enabled: !!admin
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      <ScreenHeader title="Dashboard" />
      <Text style={styles.heading}>Welcome back, {admin?.username}</Text>
      <Text style={styles.subheading}>
        You are managing the <Text style={{ fontWeight: '700' }}>{admin?.adminGroup}</Text> group.
      </Text>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatusCard label="Members" value={data?.stats.totalUsers ?? 0} accentColor="#2563eb" />
        <StatusCard label="Verified" value={data?.stats.verifiedUsers ?? 0} accentColor="#22c55e" />
      </View>

      <View style={styles.statsGrid}>
        <StatusCard label="Pending" value={data?.stats.pendingVerification ?? 0} accentColor="#f97316" />
        <StatusCard label="Events" value={data?.stats.totalEvents ?? 0} accentColor="#8b5cf6" />
      </View>

      <View style={styles.statsGrid}>
        <StatusCard label="Songs" value={data?.stats.totalSongs ?? 0} accentColor="#ec4899" />
        <StatusCard label="Ideas" value={data?.stats.ideas ?? 0} accentColor="#f59e0b" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={styles.quickActionText}>Manage Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>🎵</Text>
            <Text style={styles.quickActionText}>Manage Songs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionText}>Manage Members</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionIcon}>💡</Text>
            <Text style={styles.quickActionText}>Review Ideas</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  statsGrid: {
    flexDirection: 'row',
    gap: 12
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
    marginBottom: 12
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  quickAction: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  activityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  activityMeta: {
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



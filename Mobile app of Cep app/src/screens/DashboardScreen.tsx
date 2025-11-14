import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboard } from '@/services/adminService';
import { StatusCard } from '@/components/StatusCard';

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
      <Text style={styles.heading}>Welcome back, {admin?.username}</Text>
      <Text style={styles.subheading}>
        You are managing the <Text style={{ fontWeight: '700' }}>{admin?.adminGroup}</Text> group.
      </Text>

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
  }
});



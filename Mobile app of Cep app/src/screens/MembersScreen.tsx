import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approveMember, fetchMembers, fetchPendingMembers, rejectMember } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { Member } from '@/types';
import { MemberListItem } from '@/components/MemberListItem';

type TabKey = 'approved' | 'pending';

export const MembersScreen: React.FC = () => {
  const { admin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('approved');

  const membersQuery = useQuery({
    queryKey: ['members', admin?.adminGroup],
    queryFn: () => fetchMembers(admin!),
    enabled: !!admin
  });

  const pendingQuery = useQuery({
    queryKey: ['pending-members', admin?.adminGroup],
    queryFn: () => fetchPendingMembers(admin!),
    enabled: !!admin
  });

  const approveMutation = useMutation({
    mutationFn: (member: Member) => approveMember(admin!, member._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', admin?.adminGroup] });
      queryClient.invalidateQueries({ queryKey: ['pending-members', admin?.adminGroup] });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (member: Member) => rejectMember(admin!, member._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', admin?.adminGroup] });
      queryClient.invalidateQueries({ queryKey: ['pending-members', admin?.adminGroup] });
    }
  });

  const dataset = useMemo(() => {
    if (activeTab === 'approved') {
      return membersQuery.data || [];
    }
    return pendingQuery.data || [];
  }, [activeTab, membersQuery.data, pendingQuery.data]);

  const onApprove = (member: Member) => {
    Alert.alert('Approve member', `Approve ${member.username || member.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        style: 'default',
        onPress: () => approveMutation.mutate(member)
      }
    ]);
  };

  const onReject = (member: Member) => {
    Alert.alert('Reject member', `Reject ${member.username || member.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => rejectMutation.mutate(member)
      }
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={(activeTab === 'approved' ? membersQuery.isFetching : pendingQuery.isFetching) || false}
          onRefresh={() => {
            if (activeTab === 'approved') {
              membersQuery.refetch();
            } else {
              pendingQuery.refetch();
            }
          }}
        />
      }
    >
      <Text style={styles.heading}>Members</Text>
      <Text style={styles.subheading}>
        Manage member approvals for the {admin?.adminGroup} family.
      </Text>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tabButton, activeTab === 'approved' && styles.tabButtonActive]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.tabTextActive]}>
            Approved ({membersQuery.data?.length ?? 0})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingQuery.data?.length ?? 0})
          </Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 12 }}>
        {dataset.map((member) => (
          <MemberListItem
            key={member._id}
            member={member}
            showActions={activeTab === 'pending'}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}

        {dataset.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'No pending members' : 'No members yet'}
            </Text>
            <Text style={styles.emptySubtitle}>Pull to refresh after new registrations.</Text>
          </View>
        )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    padding: 4
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 999
  },
  tabButtonActive: {
    backgroundColor: '#fff'
  },
  tabText: {
    fontWeight: '600',
    color: '#475569'
  },
  tabTextActive: {
    color: '#0f172a'
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  emptySubtitle: {
    color: '#64748b',
    marginTop: 4
  }
});



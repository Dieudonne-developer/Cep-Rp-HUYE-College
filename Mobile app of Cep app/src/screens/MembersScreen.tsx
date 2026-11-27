import React, { useMemo, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Pressable
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approveMember, createCepMember, fetchMembers, fetchPendingMembers, rejectMember } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { Member } from '@/types';
import { MemberListItem } from '@/components/MemberListItem';
import { ScreenHeader } from '@/components/ScreenHeader';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

type TabKey = 'approved' | 'pending';

export const MembersScreen: React.FC = () => {
  const { admin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('approved');
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ username: '', email: '', contactNumber: '' });

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

  const handleRegister = async () => {
    if (!admin) return;
    if (!regForm.username.trim() || !regForm.email.trim() || !regForm.contactNumber.trim()) {
      Alert.alert('Error', 'Username, email and contact number are required.');
      return;
    }
    setRegistering(true);
    try {
      await createCepMember(admin, { ...regForm, group: admin.adminGroup });
      setShowRegister(false);
      setRegForm({ username: '', email: '', contactNumber: '' });
      queryClient.invalidateQueries({ queryKey: ['members', admin.adminGroup] });
      queryClient.invalidateQueries({ queryKey: ['pending-members', admin.adminGroup] });
      Alert.alert('Success', 'Member registered. They will receive an email invitation to set up their account.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to register member');
    } finally {
      setRegistering(false);
    }
  };

  const handleExportCsv = async () => {
    const rows = membersQuery.data || [];
    if (rows.length === 0) {
      Alert.alert('Export', 'No members to export.');
      return;
    }
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [
      'Username,Email,Contact Number,Status,Created At',
      ...rows.map((m: any) =>
        [m.username, m.email, m.contactNumber, m.status, m.createdAt ? new Date(m.createdAt).toISOString() : ''].map(escape).join(',')
      )
    ].join('\n');
    try {
      const fileName = `members-${admin?.adminGroup || 'export'}.csv`;
      const path = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(path, csv);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: `Save ${fileName}` });
      } else {
        await Share.share({ url: path, title: fileName });
      }
    } catch {
      Alert.alert('Export', 'Could not save the CSV file on this device.');
    }
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
      <ScreenHeader title="Members" />
      <Text style={styles.subheading}>
        Manage member approvals for the {admin?.adminGroup} family.
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.registerBtn} onPress={() => setShowRegister(true)}>
          <Text style={styles.registerBtnText}>+ Register Member</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportCsv}>
          <Text style={styles.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

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

      <Modal visible={showRegister} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Register Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={regForm.username}
              onChangeText={v => setRegForm({ ...regForm, username: v })}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={regForm.email}
              onChangeText={v => setRegForm({ ...regForm, email: v })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Contact number"
              value={regForm.contactNumber}
              onChangeText={v => setRegForm({ ...regForm, contactNumber: v })}
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRegister(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleRegister} disabled={registering}>
                <Text style={styles.saveBtnText}>{registering ? 'Registering...' : 'Register'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#3590F3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  registerBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14
  },
  exportBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3590F3'
  },
  exportBtnText: {
    color: '#3590F3',
    fontWeight: '700',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
    color: '#0f172a'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelBtnText: {
    color: '#334155',
    fontWeight: '700'
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#3590F3',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700'
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



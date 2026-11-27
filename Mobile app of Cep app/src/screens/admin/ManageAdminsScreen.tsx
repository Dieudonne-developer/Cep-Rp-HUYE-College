import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchSuperAdmins, createSuperAdmin, deleteSuperAdmin, suspendSuperAdmin, approveSuperAdmin } from '@/services/adminService';
import { ScreenHeader } from '@/components/ScreenHeader';

const ALL_GROUPS = [
  { value: 'all', label: 'All Groups' },
  { value: 'cepier', label: 'CEP' },
  { value: 'choir', label: 'Choir' },
  { value: 'anointed', label: 'Anointed' },
  { value: 'abanyamugisha', label: 'Abanyamugisha' },
  { value: 'psalm23', label: 'Psalm 23' },
  { value: 'psalm46', label: 'Psalm 46' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'social', label: 'Social' },
  { value: 'evangelical', label: 'Evangelical' }
];

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'super-admin', label: 'Super Admin' }
];

export const ManageAdminsScreen: React.FC = () => {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    contactNumber: '',
    adminGroup: 'choir',
    role: 'admin'
  });

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const data = await fetchSuperAdmins(admin);
      setAdmins(data);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!formData.email || !formData.username) {
      Alert.alert('Error', 'Email and username are required');
      return;
    }
    setCreating(true);
    try {
      await createSuperAdmin(admin!, formData);
      setShowCreateModal(false);
      setFormData({ email: '', username: '', contactNumber: '', adminGroup: 'choir', role: 'admin' });
      load();
      Alert.alert('Success', 'Admin created successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (adminId: string) => {
    Alert.alert('Delete Admin', 'Are you sure you want to delete this admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSuperAdmin(admin!, adminId);
            load();
            Alert.alert('Success', 'Admin deleted');
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  const handleSuspend = (adminId: string, adminGroup: string) => {
    Alert.alert('Suspend Admin', 'Are you sure you want to suspend this admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: async () => {
          try {
            await suspendSuperAdmin(admin!, adminId, adminGroup);
            load();
            Alert.alert('Success', 'Admin suspended');
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to suspend');
          }
        }
      }
    ]);
  };

  const handleApprove = (adminId: string, adminGroup: string) => {
    Alert.alert('Approve Admin', 'Are you sure you want to approve this admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await approveSuperAdmin(admin!, adminId, adminGroup);
            load();
            Alert.alert('Success', 'Admin approved');
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to approve');
          }
        }
      }
    ]);
  };

  const filteredAdmins = admins.filter(a => {
    if (filterGroup !== 'all' && a.adminGroup !== filterGroup) return false;
    if (filterStatus === 'approved' && !a.isApproved) return false;
    if (filterStatus === 'suspended' && a.isApproved) return false;
    return true;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return '#a855f7';
      case 'admin': return '#3b82f6';
      case 'editor': return '#22c55e';
      case 'viewer': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getGroupLabel = (group: string) => {
    const g = ALL_GROUPS.find(x => x.value === group);
    return g ? g.label : group;
  };

  const getRoleLabel = (role: string) => {
    const r = ROLES.find(x => x.value === role);
    return r ? r.label : role;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <ScreenHeader title="Manage Admins" />
      <Text style={styles.subheading}>View, create, and manage admin accounts</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+ Create New Admin</Text>
      </TouchableOpacity>

      {/* Filters */}
      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Filter by Group: {ALL_GROUPS.find(g => g.value === filterGroup)?.label}</Text>
        <Text style={styles.filterLabel}>Filter by Status: {filterStatus === 'all' ? 'All' : filterStatus}</Text>
      </View>

      {/* Admin List */}
      <View style={styles.list}>
        {filteredAdmins.map((item) => (
          <View key={item._id || item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.username || item.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.adminInfo}>
                <Text style={styles.adminName}>{item.username || item.email}</Text>
                <Text style={styles.adminEmail}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={[styles.badge, { backgroundColor: '#e5e7eb' }]}>
                <Text style={styles.badgeText}>{getGroupLabel(item.adminGroup)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getRoleColor(item.role) + '33' }]}>
                <Text style={[styles.badgeText, { color: getRoleColor(item.role) }]}>{getRoleLabel(item.role)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.isApproved ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.badgeText, { color: item.isApproved ? '#16a34a' : '#dc2626' }]}>
                  {item.isApproved ? 'Approved' : 'Suspended'}
                </Text>
              </View>
              {item.email !== admin?.email ? (
                <>
                  {item.isApproved ? (
                    <TouchableOpacity onPress={() => handleSuspend(item._id || item.id, item.adminGroup)}>
                      <Text style={styles.actionText}>Suspend</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleApprove(item._id || item.id, item.adminGroup)}>
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(item._id || item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.currentUser}>Current User</Text>
              )}
            </View>
          </View>
        ))}

        {filteredAdmins.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No admins found</Text>
          </View>
        )}
      </View>

      {/* Create Admin Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Admin</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={formData.email}
                onChangeText={(v) => setFormData({ ...formData, email: v })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Username *"
                value={formData.username}
                onChangeText={(v) => setFormData({ ...formData, username: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.contactNumber}
                onChangeText={(v) => setFormData({ ...formData, contactNumber: v })}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleCreate} disabled={creating}>
                <Text style={styles.submitButtonText}>{creating ? 'Creating...' : 'Create Admin'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20
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
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  filters: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  filterLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8
  },
  list: {
    gap: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  },
  adminInfo: {
    flex: 1
  },
  adminName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  adminEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600'
  },
  badgeText: {
    color: '#0f172a'
  },
  actionText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600'
  },
  deleteText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600'
  },
  currentUser: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalClose: {
    fontSize: 28,
    color: '#64748b'
  },
  modalBody: {
    padding: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});

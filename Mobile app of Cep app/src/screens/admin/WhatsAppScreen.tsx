import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import {
  fetchWhatsAppGroups,
  createWhatsAppGroup,
  updateWhatsAppGroup,
  deleteWhatsAppGroup,
  fetchWhatsAppRequests,
  decideWhatsAppRequest
} from '@/services/adminService';
import { ScreenHeader } from '@/components/ScreenHeader';

export const WhatsAppScreen: React.FC = () => {
  const { admin } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    inviteUrl: '',
    description: '',
    isActive: true
  });

  const isSuperAdmin = (admin?.role || '').toLowerCase() === 'super-admin';

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const [g, r] = await Promise.all([fetchWhatsAppGroups(admin), fetchWhatsAppRequests(admin)]);
      const visibleGroups = isSuperAdmin ? g : g.filter((grp: any) => grp.canManage || grp.slug === admin.adminGroup);
      const manageableIds = new Set(visibleGroups.map((grp: any) => String(grp.id || grp._id)));
      const groupSlugById = new Map(g.map((grp: any) => [String(grp.id || grp._id), grp.slug]));
      const visibleRequests = isSuperAdmin
        ? r
        : r.filter((req: any) => manageableIds.has(String(req.groupId)) || groupSlugById.get(String(req.groupId)) === admin.adminGroup);
      setGroups(visibleGroups);
      setRequests(visibleRequests);
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  }, [admin, isSuperAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateGroup = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Group name is required');
      return;
    }
    setCreating(true);
    try {
      await createWhatsAppGroup(admin!, formData);
      setShowCreateModal(false);
      setFormData({ name: '', slug: '', inviteUrl: '', description: '', isActive: true });
      load();
      Alert.alert('Success', 'Group created successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    setCreating(true);
    try {
      await updateWhatsAppGroup(admin!, editingGroup.id || editingGroup._id, formData);
      setShowEditModal(false);
      setEditingGroup(null);
      setFormData({ name: '', slug: '', inviteUrl: '', description: '', isActive: true });
      load();
      Alert.alert('Success', 'Group updated successfully');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteWhatsAppGroup(admin!, groupId);
            load();
            Alert.alert('Success', 'Group deleted');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  const handleDecideRequest = async (requestId: string, approve: boolean) => {
    try {
      await decideWhatsAppRequest(admin!, requestId, approve);
      load();
      Alert.alert('Success', approve ? 'Request approved' : 'Request rejected');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    }
  };

  const openEditModal = (group: any) => {
    setEditingGroup(group);
    setFormData({
      name: group.name || '',
      slug: group.slug || '',
      inviteUrl: group.inviteUrl || group.invite_link || '',
      description: group.description || '',
      isActive: group.isActive !== false
    });
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader title="WhatsApp Group Management" />

      <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        {/* Add Group Form - Super Admin only (backend enforces this too) */}
        {isSuperAdmin && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add a group</Text>
          <TextInput
            style={styles.input}
            placeholder="Group name"
            value={formData.name}
            onChangeText={v => setFormData({ ...formData, name: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="WhatsApp invitation link"
            value={formData.inviteUrl}
            onChangeText={v => setFormData({ ...formData, inviteUrl: v })}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={formData.description}
            onChangeText={v => setFormData({ ...formData, description: v })}
            multiline
          />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Active</Text>
            <Switch
              value={formData.isActive}
              onValueChange={v => setFormData({ ...formData, isActive: v })}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={formData.isActive ? '#ffffff' : '#ffffff'}
            />
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCreateGroup} disabled={creating}>
            <Text style={styles.actionBtnText}>{creating ? 'Adding...' : 'Add Group'}</Text>
          </TouchableOpacity>
        </View>
        )}

        {/* Groups List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Groups</Text>
          {groups.map((group, idx) => (
            <View key={group.id || group._id || idx} style={styles.groupCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDesc}>{group.description || 'No description'}</Text>
                <View style={styles.groupMeta}>
                  <Text style={group.isActive ? styles.activeBadge : styles.inactiveBadge}>
                    {group.isActive ? 'Active' : 'Inactive'}
                  </Text>
                  {group.inviteUrl || group.invite_link ? (
                    <Text style={styles.linkBadge}>Link set</Text>
                  ) : (
                    <Text style={styles.noLinkBadge}>No link</Text>
                  )}
                </View>
              </View>
              <View style={styles.groupActions}>
                <TouchableOpacity onPress={() => openEditModal(group)}>
                  <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
                {(isSuperAdmin || group.canManage) && (
                <TouchableOpacity onPress={() => handleDeleteGroup(group.id || group._id)}>
                  <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {groups.length === 0 && <Text style={styles.emptyText}>No groups found.</Text>}
        </View>

        {/* Access Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Requests</Text>
          {requests.map((req, idx) => (
            <View key={req.id || req._id || idx} style={styles.requestCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestName}>{req.name || req.username || req.email}</Text>
                <Text style={styles.requestContact}>{req.contactNumber || req.phone || req.email || ''}</Text>
                <Text style={styles.requestStatus}>Status: {req.status || 'pending'}</Text>
              </View>
              {req.status === 'pending' && (
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleDecideRequest(req.id || req._id, true)}
                  >
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleDecideRequest(req.id || req._id, false)}
                  >
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          {requests.length === 0 && <Text style={styles.emptyText}>No pending requests.</Text>}
        </View>
      </ScrollView>

      {/* Edit Group Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Group</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Group name"
                value={formData.name}
                onChangeText={v => setFormData({ ...formData, name: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="WhatsApp invitation link"
                value={formData.inviteUrl}
                onChangeText={v => setFormData({ ...formData, inviteUrl: v })}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={formData.description}
                onChangeText={v => setFormData({ ...formData, description: v })}
                multiline
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Active</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={v => setFormData({ ...formData, isActive: v })}
                  trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                  thumbColor={formData.isActive ? '#ffffff' : '#ffffff'}
                />
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={handleUpdateGroup} disabled={creating}>
                <Text style={styles.actionBtnText}>{creating ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#3590F3',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  content: { flex: 1 },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: { fontSize: 14, color: '#374151' },
  actionBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  groupName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  groupDesc: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  groupMeta: { flexDirection: 'row', gap: 8, marginTop: 8 },
  activeBadge: { fontSize: 10, color: '#16a34a', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  inactiveBadge: { fontSize: 10, color: '#dc2626', backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  linkBadge: { fontSize: 10, color: '#16a34a', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  noLinkBadge: { fontSize: 10, color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  groupActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  deleteBtn: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  requestName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  requestContact: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  requestStatus: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  requestActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  approveBtn: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  approveBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  rejectBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  rejectBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 12, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  modalClose: { fontSize: 24, color: '#6b7280' },
  modalBody: { padding: 16 },
});

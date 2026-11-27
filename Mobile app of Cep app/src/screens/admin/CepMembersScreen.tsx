import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchCepMembers, deleteCepMember } from '@/services/adminService';
import { ScreenHeader } from '@/components/ScreenHeader';

type CepMember = {
  _id: string;
  username: string;
  email: string;
  contact_number?: string;
  user_group: string;
  is_approved: boolean;
  created_at: string;
};

const GROUP_LABELS: Record<string, string> = {
  'cepier': 'CEP',
  'choir': 'Choir',
  'anointed': 'Anointed',
  'abanyamugisha': 'Abanyamugisha',
  'psalm23': 'Psalm 23',
  'psalm46': 'Psalm 46',
  'protocol': 'Protocol',
  'social': 'Social',
  'evangelical': 'Evangelical'
};

export const CepMembersScreen: React.FC = () => {
  const { admin } = useAuth();
  const [members, setMembers] = useState<CepMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contactNumber: '',
    userGroup: 'cepier'
  });

  const loadMembers = useCallback(async () => {
    if (!admin) return;
    try {
      const data = await fetchCepMembers(admin);
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch CEP members:', error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleDelete = (member: CepMember) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${member.username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCepMember(admin!, member._id);
              loadMembers();
              Alert.alert('Success', 'Member deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete member');
            }
          }
        }
      ]
    );
  };

  const handleCreate = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Username and email are required');
      return;
    }
    try {
      // This would use the createCepMember function, but it's not fully implemented yet
      Alert.alert('Info', 'Create member functionality requires backend endpoint');
      setShowCreateModal(false);
      setFormData({ username: '', email: '', contactNumber: '', userGroup: 'cepier' });
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create member');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadMembers} />}
    >
      <ScreenHeader title="CEP Members" />
      <Text style={styles.subheading}>Manage all CEP members across all groups</Text>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+ Add New Member</Text>
      </TouchableOpacity>

      <View style={styles.list}>
        {members.map((member) => (
          <View key={member._id} style={styles.card}>
            <View style={styles.cardContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(member.username || member.email).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{member.username}</Text>
                <Text style={styles.email}>{member.email}</Text>
                <View style={styles.meta}>
                  <Text style={[styles.badge, styles.groupBadge]}>
                    {GROUP_LABELS[member.user_group] || member.user_group}
                  </Text>
                  <Text style={[
                    styles.badge,
                    member.is_approved ? styles.approvedBadge : styles.pendingBadge
                  ]}>
                    {member.is_approved ? 'Active' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(member)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {members.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No CEP members found</Text>
            <Text style={styles.emptySubtitle}>Add members to get started</Text>
          </View>
        )}
      </View>

      {/* Create Member Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Member</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Username *"
                value={formData.username}
                onChangeText={(v) => setFormData({ ...formData, username: v })}
              />
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
                placeholder="Phone Number"
                value={formData.contactNumber}
                onChangeText={(v) => setFormData({ ...formData, contactNumber: v })}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.actionButton} onPress={handleCreate}>
                <Text style={styles.actionButtonText}>Create Member</Text>
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
  cardContent: {
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
  info: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '600'
  },
  groupBadge: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca'
  },
  approvedBadge: {
    backgroundColor: '#dcfce7',
    color: '#16a34a'
  },
  pendingBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
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
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
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
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});

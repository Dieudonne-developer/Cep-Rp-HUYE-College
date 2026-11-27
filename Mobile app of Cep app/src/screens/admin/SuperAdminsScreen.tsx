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
  Dimensions,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
import {
  fetchSuperAdmins,
  createSuperAdmin,
  deleteSuperAdmin,
  suspendSuperAdmin,
  approveSuperAdmin,
  fetchGlobalActivities,
  createGlobalActivity,
  deleteGlobalActivity,
  fetchGlobalIdeas,
  implementGlobalIdea,
  deleteGlobalIdea,
  fetchGlobalSupport,
  saveGlobalSupport
} from '@/services/adminService';
import { API_BASE_URL } from '@/config/api';

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

const GLOBAL_TABS = ['Activities', 'Ideas', 'Support', 'CEP Members'];

export const SuperAdminsScreen: React.FC = () => {
  const { admin, logout } = useAuth();
  const [mainTab, setMainTab] = useState<'admins' | 'homepage'>('admins');
  const [globalTab, setGlobalTab] = useState('Activities');
  const [admins, setAdmins] = useState<any[]>([]);
  const [globalActivities, setGlobalActivities] = useState<any[]>([]);
  const [globalIdeas, setGlobalIdeas] = useState<any[]>([]);
  const [supportDoc, setSupportDoc] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    contactNumber: '',
    adminGroup: 'choir',
    role: 'admin'
  });

  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    imageUrl: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const [a, acts, ideas, sup] = await Promise.all([
        fetchSuperAdmins(admin),
        fetchGlobalActivities(admin),
        fetchGlobalIdeas(admin),
        fetchGlobalSupport(admin)
      ]);
      setAdmins(a);
      setGlobalActivities(acts);
      setGlobalIdeas(ideas);
      setSupportDoc(sup || {});
    } catch (e) {
      console.error('Load error:', e);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateAdmin = async () => {
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
      Alert.alert('Success', 'Admin created successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSuperAdmin(admin!, adminId);
            load();
            Alert.alert('Success', 'Admin deleted');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  const handleSuspendAdmin = async (adminId: string, adminGroup: string) => {
    Alert.alert('Confirm', 'Are you sure you want to suspend this admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: async () => {
          try {
            await suspendSuperAdmin(admin!, adminId, adminGroup);
            load();
            Alert.alert('Success', 'Admin suspended');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to suspend');
          }
        }
      }
    ]);
  };

  const handleApproveAdmin = async (adminId: string, adminGroup: string) => {
    Alert.alert('Confirm', 'Are you sure you want to approve this admin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await approveSuperAdmin(admin!, adminId, adminGroup);
            load();
            Alert.alert('Success', 'Admin approved');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to approve');
          }
        }
      }
    ]);
  };

  const handleCreateActivity = async () => {
    if (!activityForm.title) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try {
      await createGlobalActivity(admin!, activityForm);
      setActivityForm({ title: '', description: '', eventDate: '', eventTime: '', location: '', imageUrl: '' });
      load();
      Alert.alert('Success', 'Activity created');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image/jpeg',
          name: result.assets[0].fileName || 'activity-image.jpg',
        } as any);

        const response = await fetch(`${API_BASE_URL}/api/admin/events/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Admin-Email': admin?.email || '',
            'X-Admin-Group': admin?.adminGroup || '',
            'X-Admin-ID': admin?.id || '',
          },
          body: formData,
        });

        const data = await response.json();
        if (data.success || data.url || data.fileUrl) {
          setActivityForm({ ...activityForm, imageUrl: data.url || data.fileUrl });
          Alert.alert('Success', 'Image uploaded');
        } else {
          Alert.alert('Error', data.message || 'Image upload failed');
        }
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to pick or upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveSupport = async () => {
    try {
      await saveGlobalSupport(admin!, supportDoc);
      Alert.alert('Success', 'Support info saved');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed');
    }
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>CEP Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Super Administrator - System Management</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Page Title */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Super Admin Dashboard</Text>
      </View>

      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, mainTab === 'admins' && styles.tabActive]}
          onPress={() => setMainTab('admins')}
        >
          <Text style={[styles.tabText, mainTab === 'admins' && styles.tabTextActive]}>Manage Admins</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mainTab === 'homepage' && styles.tabActive]}
          onPress={() => { setMainTab('homepage'); setGlobalTab('Activities'); }}
        >
          <Text style={[styles.tabText, mainTab === 'homepage' && styles.tabTextActive]}>Homepage Management</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView style={styles.content} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
          {/* Admins Tab */}
          {mainTab === 'admins' && (
            <>
              <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
                <Text style={styles.createBtnText}>+ Create New Admin</Text>
              </TouchableOpacity>

              {/* Filters */}
              <View style={styles.filters}>
                <View style={styles.filterCol}>
                  <Text style={styles.filterLabel}>Filter by Group</Text>
                  <View style={styles.picker}>
                    <Text style={styles.pickerText}>{ALL_GROUPS.find(g => g.value === filterGroup)?.label}</Text>
                  </View>
                </View>
                <View style={styles.filterCol}>
                  <Text style={styles.filterLabel}>Filter by Status</Text>
                  <View style={styles.picker}>
                    <Text style={styles.pickerText}>{filterStatus === 'all' ? 'All Status' : filterStatus}</Text>
                  </View>
                </View>
              </View>

              {/* Admin List */}
              <View style={styles.listContainer}>
                <Text style={styles.columnHeader}>ADMIN</Text>
                {filteredAdmins.map((item, idx) => (
                  <View key={item._id || item.id || idx} style={styles.adminCard}>
                    <View style={styles.adminLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(item.username || item.email || '?').charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.adminInfo}>
                        <Text style={styles.adminName}>{item.username || item.email}</Text>
                        <Text style={styles.adminEmail}>{item.email}</Text>
                      </View>
                    </View>
                    <View style={styles.adminRight}>
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
                            <TouchableOpacity onPress={() => handleSuspendAdmin(item._id || item.id, item.adminGroup)}>
                              <Text style={styles.suspendBtn}>Suspend</Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity onPress={() => handleApproveAdmin(item._id || item.id, item.adminGroup)}>
                              <Text style={styles.approveBtn}>Approve</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => handleDeleteAdmin(item._id || item.id)}>
                            <Text style={styles.deleteBtn}>Delete</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <Text style={styles.currentUser}>Current User</Text>
                      )}
                    </View>
                  </View>
                ))}
                {filteredAdmins.length === 0 && (
                  <Text style={styles.emptyText}>No admins found.</Text>
                )}
              </View>
            </>
          )}

          {/* Homepage Management Tab */}
          {mainTab === 'homepage' && (
            <View style={styles.homeContainer}>
              <View style={styles.globalTabs}>
                {GLOBAL_TABS.map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.globalTab, globalTab === tab && styles.globalTabActive]}
                    onPress={() => setGlobalTab(tab)}
                  >
                    <Text style={[styles.globalTabText, globalTab === tab && styles.globalTabTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {globalTab === 'Activities' && (
                <View style={styles.section}>
                  <View style={styles.form}>
                    <TextInput
                      style={styles.input}
                      placeholder="Title *"
                      value={activityForm.title}
                      onChangeText={v => setActivityForm({ ...activityForm, title: v })}
                    />
                    <TouchableOpacity style={styles.fileInputBtn} onPress={handlePickImage} disabled={uploadingImage}>
                      <Text style={styles.fileInputBtnText}>{uploadingImage ? 'Uploading...' : 'Choose File'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.fileStatus}>
                      {activityForm.imageUrl ? 'Image selected' : 'No file chosen'}
                    </Text>
                    {activityForm.imageUrl && (
                      <Text style={styles.imagePreviewText} numberOfLines={1}>
                        {activityForm.imageUrl}
                      </Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Date (YYYY-MM-DD)"
                      value={activityForm.eventDate}
                      onChangeText={v => setActivityForm({ ...activityForm, eventDate: v })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Time (e.g., 10:00)"
                      value={activityForm.eventTime}
                      onChangeText={v => setActivityForm({ ...activityForm, eventTime: v })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Location"
                      value={activityForm.location}
                      onChangeText={v => setActivityForm({ ...activityForm, location: v })}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Description"
                      value={activityForm.description}
                      onChangeText={v => setActivityForm({ ...activityForm, description: v })}
                      multiline
                    />
                    <TouchableOpacity style={styles.actionBtn} onPress={handleCreateActivity}>
                      <Text style={styles.actionBtnText}>Add Activity</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.list}>
                    {globalActivities.map((item, idx) => (
                      <View key={item._id || item.id || idx} style={styles.listItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemSub}>{item.location} {item.date ? '• ' + new Date(item.date).toLocaleDateString() : ''}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { Alert.alert('Confirm', 'Delete this activity?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteGlobalActivity(admin!, item._id || item.id); load(); } }]); }}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {globalActivities.length === 0 && <Text style={styles.emptyText}>No activities yet.</Text>}
                  </View>
                </View>
              )}

              {globalTab === 'Ideas' && (
                <View style={styles.section}>
                  <Text style={styles.sectionDescription}>
                    Public submissions appear on homepage; you can mark as implemented or delete.
                  </Text>
                  <View style={styles.list}>
                    {globalIdeas.map((item, idx) => (
                      <View key={item._id || item.id || idx} style={styles.listItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemTitle}>{item.idea}</Text>
                          <Text style={styles.itemSub}>
                            {item.anonymous ? 'Anonymous' : (item.name || 'Member')}
                            {item.implementedDate ? ' • Implemented ' + new Date(item.implementedDate).toLocaleDateString() : ''}
                          </Text>
                        </View>
                        {!item.implementedDate && (
                          <TouchableOpacity onPress={async () => { await implementGlobalIdea(admin!, item._id || item.id); load(); }}>
                            <Text style={styles.doneText}>Mark Implemented</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => { Alert.alert('Confirm', 'Delete this idea?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await deleteGlobalIdea(admin!, item._id || item.id); load(); } }]); }}>
                          <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    {globalIdeas.length === 0 && <Text style={styles.emptyText}>No ideas yet.</Text>}
                  </View>
                </View>
              )}

              {globalTab === 'Support' && (
                <View style={styles.section}>
                  <View style={styles.form}>
                    <TextInput
                      style={styles.input}
                      placeholder="Support page title"
                      value={supportDoc.title || ''}
                      onChangeText={v => setSupportDoc({ ...supportDoc, title: v })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Bank Name"
                      value={supportDoc.bank?.bankName || ''}
                      onChangeText={v => setSupportDoc({ ...supportDoc, bank: { ...supportDoc.bank, bankName: v } })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Account Name"
                      value={supportDoc.bank?.accountName || ''}
                      onChangeText={v => setSupportDoc({ ...supportDoc, bank: { ...supportDoc.bank, accountName: v } })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Account Number"
                      value={supportDoc.bank?.accountNumber || ''}
                      onChangeText={v => setSupportDoc({ ...supportDoc, bank: { ...supportDoc.bank, accountNumber: v } })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="MTN"
                      value={supportDoc.mobileMoney?.mtn || ''}
                      onChangeText={v => setSupportDoc({ ...supportDoc, mobileMoney: { ...supportDoc.mobileMoney, mtn: v } })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Airtel"
                      value={supportDoc.mobileMoney?.airtel || ''}
                      onChangeText={v => setSupportDoc({ ...supportDoc, mobileMoney: { ...supportDoc.mobileMoney, airtel: v } })}
                    />
                    <TouchableOpacity style={styles.actionBtn} onPress={handleSaveSupport}>
                      <Text style={styles.actionBtnText}>Save Support</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {globalTab === 'CEP Members' && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>CEP Members - All registered users</Text>
                  <Text style={styles.emptyText}>CSV import/export will be added here.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

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
                onChangeText={v => setFormData({ ...formData, email: v })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Username / Full name *"
                value={formData.username}
                onChangeText={v => setFormData({ ...formData, username: v })}
              />
              <TextInput
                style={styles.input}
                placeholder="Contact / Phone number"
                value={formData.contactNumber}
                onChangeText={v => setFormData({ ...formData, contactNumber: v })}
                keyboardType="phone-pad"
              />
              <Text style={styles.note}>An invitation email will be sent to the admin's email.</Text>
              <View style={styles.picker}>
                <Text style={styles.pickerLabel}>Admin Group: {getGroupLabel(formData.adminGroup)}</Text>
              </View>
              <View style={styles.picker}>
                <Text style={styles.pickerLabel}>Role: {getRoleLabel(formData.role)}</Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCreateAdmin} disabled={creating}>
                <Text style={styles.actionBtnText}>{creating ? 'Creating...' : 'Create Admin'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sidebar */}
      <Modal visible={sidebarOpen} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.sidebarOverlay}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sidebar} onPress={e => e.stopPropagation()}>
            <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>CEP Admin Panel</Text>
              <TouchableOpacity onPress={() => setSidebarOpen(false)} style={styles.sidebarClose}>
                <Text style={styles.sidebarCloseText}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.sidebarContent}>
              <TouchableOpacity style={styles.sidebarItem} onPress={() => { setSidebarOpen(false); }}>
                <Text style={styles.sidebarItemText}>WhatsApp Groups</Text>
              </TouchableOpacity>

              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>HOMEPAGE</Text>
                <TouchableOpacity
                  style={[styles.sidebarItem, mainTab === 'homepage' && globalTab === 'Activities' && styles.sidebarItemActive]}
                  onPress={() => { setMainTab('homepage'); setGlobalTab('Activities'); setSidebarOpen(false); }}
                >
                  <Text style={[styles.sidebarItemText, mainTab === 'homepage' && globalTab === 'Activities' && styles.sidebarItemTextActive]}>Activities</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sidebarItem, mainTab === 'homepage' && globalTab === 'Ideas' && styles.sidebarItemActive]}
                  onPress={() => { setMainTab('homepage'); setGlobalTab('Ideas'); setSidebarOpen(false); }}
                >
                  <Text style={[styles.sidebarItemText, mainTab === 'homepage' && globalTab === 'Ideas' && styles.sidebarItemTextActive]}>Ideas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sidebarItem, mainTab === 'homepage' && globalTab === 'Support' && styles.sidebarItemActive]}
                  onPress={() => { setMainTab('homepage'); setGlobalTab('Support'); setSidebarOpen(false); }}
                >
                  <Text style={[styles.sidebarItemText, mainTab === 'homepage' && globalTab === 'Support' && styles.sidebarItemTextActive]}>Support</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sidebarItem, mainTab === 'homepage' && globalTab === 'CEP Members' && styles.sidebarItemActive]}
                  onPress={() => { setMainTab('homepage'); setGlobalTab('CEP Members'); setSidebarOpen(false); }}
                >
                  <Text style={[styles.sidebarItemText, mainTab === 'homepage' && globalTab === 'CEP Members' && styles.sidebarItemTextActive]}>CEP Members</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.sidebarItem} onPress={() => { setSidebarOpen(false); }}>
                <Text style={styles.sidebarItemText}>View Public Site</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#3590F3',
  },
  menuBtn: { padding: 8, marginRight: 8 },
  menuIcon: { fontSize: 24, color: '#ffffff', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 12, color: '#bfdbfe', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  logoutText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  titleSection: { paddingHorizontal: 16, paddingVertical: 16 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
  tabText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#3b82f6', fontWeight: '600' },
  content: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  createBtn: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12 },
  filterCol: { flex: 1 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  picker: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  pickerText: { fontSize: 14, color: '#1f2937' },
  listContainer: { paddingHorizontal: 16, marginTop: 16 },
  columnHeader: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  adminCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  adminLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  adminInfo: { flex: 1 },
  adminName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  adminEmail: { fontSize: 12, color: '#6b7280' },
  adminRight: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  suspendBtn: { fontSize: 12, color: '#f97316', fontWeight: '600', marginTop: 4 },
  approveBtn: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  deleteBtn: { fontSize: 12, color: '#dc2626', fontWeight: '600', marginTop: 4 },
  currentUser: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#9ca3af', marginTop: 20, fontSize: 14 },
  homeContainer: { padding: 16 },
  globalTabs: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  globalTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#e5e7eb' },
  globalTabActive: { backgroundColor: '#3b82f6' },
  globalTabText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  globalTabTextActive: { color: '#ffffff' },
  section: {},
  form: { backgroundColor: '#ffffff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
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
  fileInputBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileInputBtnText: { color: '#3b82f6', fontSize: 14, fontWeight: '500' },
  fileStatus: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  imagePreviewText: { fontSize: 11, color: '#16a34a', marginBottom: 8 },
  actionBtn: { backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  actionBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  list: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  listItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },
  itemSub: { fontSize: 12, color: '#6b7280' },
  doneText: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginRight: 12 },
  deleteText: { fontSize: 12, color: '#dc2626', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  sectionDescription: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  note: { fontSize: 12, color: '#6b7280', marginBottom: 12, marginTop: 8 },
  pickerLabel: { fontSize: 14, color: '#1f2937' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 12, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  modalClose: { fontSize: 24, color: '#6b7280' },
  modalBody: { padding: 16 },
  sidebarOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebar: { width: width * 0.75, height: '100%', backgroundColor: '#ffffff' },
  sidebarHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sidebarTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  sidebarClose: { position: 'absolute', right: 16, top: 20 },
  sidebarCloseText: { fontSize: 24, color: '#ffffff' },
  sidebarContent: { flex: 1 },
  sidebarSection: { marginTop: 16 },
  sidebarSectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', paddingHorizontal: 20, marginBottom: 8, textTransform: 'uppercase' },
  sidebarItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sidebarItemActive: { backgroundColor: '#eff6ff', borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  sidebarItemText: { fontSize: 15, color: '#1f2937' },
  sidebarItemTextActive: { color: '#3b82f6', fontWeight: '600' },
});

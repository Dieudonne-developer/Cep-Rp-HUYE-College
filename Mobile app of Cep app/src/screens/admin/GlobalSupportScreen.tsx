import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchGlobalSupport, saveGlobalSupport } from '@/services/adminService';
import { ScreenHeader } from '@/components/ScreenHeader';

export const GlobalSupportScreen: React.FC = () => {
  const { admin } = useAuth();
  const [support, setSupport] = useState<any>({
    title: 'Support CEP RP Huye College',
    bank: {
      bankName: 'Bank of Kigali',
      accountName: 'CEP Ishyanga Ryera Choir',
      accountNumber: '00040-06945783-07',
      swiftCode: 'BKIGRWRW'
    },
    mobileMoney: {
      mtn: '0788 123 456 (Alice Uwase)',
      airtel: '0732 987 654 (Eric Mugisha)'
    },
    onlineDonationNote: 'Paystack verification pending server integration.'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const data = await fetchGlobalSupport(admin);
      if (data && Object.keys(data).length > 0) {
        setSupport(data);
      }
    } catch (error) {
      console.error('Failed to fetch support info:', error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveGlobalSupport(admin!, support);
      Alert.alert('Success', 'Support information saved');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <ScreenHeader title="Support" />
      <Text style={styles.subheading}>Manage support information shown on the public homepage</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Title</Text>
        <TextInput
          style={styles.input}
          value={support.title}
          onChangeText={(v) => setSupport({ ...support, title: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Bank Name"
          value={support.bank?.bankName || ''}
          onChangeText={(v) => setSupport({ ...support, bank: { ...support.bank, bankName: v } })}
        />
        <TextInput
          style={styles.input}
          placeholder="Account Name"
          value={support.bank?.accountName || ''}
          onChangeText={(v) => setSupport({ ...support, bank: { ...support.bank, accountName: v } })}
        />
        <TextInput
          style={styles.input}
          placeholder="Account Number"
          value={support.bank?.accountNumber || ''}
          onChangeText={(v) => setSupport({ ...support, bank: { ...support.bank, accountNumber: v } })}
        />
        <TextInput
          style={styles.input}
          placeholder="SWIFT Code"
          value={support.bank?.swiftCode || ''}
          onChangeText={(v) => setSupport({ ...support, bank: { ...support.bank, swiftCode: v } })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mobile Money</Text>
        <TextInput
          style={styles.input}
          placeholder="MTN Number & Name"
          value={support.mobileMoney?.mtn || ''}
          onChangeText={(v) => setSupport({ ...support, mobileMoney: { ...support.mobileMoney, mtn: v } })}
        />
        <TextInput
          style={styles.input}
          placeholder="Airtel Number & Name"
          value={support.mobileMoney?.airtel || ''}
          onChangeText={(v) => setSupport({ ...support, mobileMoney: { ...support.mobileMoney, airtel: v } })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Donation Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional information about online donations"
          value={support.onlineDonationNote || ''}
          onChangeText={(v) => setSupport({ ...support, onlineDonationNote: v })}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});

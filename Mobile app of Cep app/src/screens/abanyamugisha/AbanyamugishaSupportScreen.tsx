import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';

export const AbanyamugishaSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [supportData, setSupportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/home/support/abanyamugisha`);
      const data = await response.json();
      setSupportData(data.support || {});
    } catch (error) {
      console.error('Failed to load support data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const bank = supportData?.bank || {};
  const mobileMoney = supportData?.mobileMoney || {};
  const hasBankInfo = bank.bankName || bank.accountName || bank.accountNumber || bank.swiftCode;
  const hasMobileMoneyInfo = mobileMoney.mtn || mobileMoney.airtel;

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.title}>Support Abanyamugisha</Text>
        <Text style={styles.subtitle}>Your generous support helps the Abanyamugisha Family continue its ministry.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Support</Text>

          {hasBankInfo ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Bank Transfer</Text>
              {bank.bankName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Bank:</Text>
                  <Text style={styles.infoValue}>{bank.bankName}</Text>
                </View>
              )}
              {bank.accountName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Name:</Text>
                  <Text style={styles.infoValue}>{bank.accountName}</Text>
                </View>
              )}
              {bank.accountNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Number:</Text>
                  <Text style={styles.infoValue}>{bank.accountNumber}</Text>
                </View>
              )}
              {bank.swiftCode && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Swift Code:</Text>
                  <Text style={styles.infoValue}>{bank.swiftCode}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyText}>Bank transfer information will be available soon.</Text>
            </View>
          )}

          {hasMobileMoneyInfo ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mobile Money</Text>
              {mobileMoney.mtn && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>MTN:</Text>
                  <Text style={styles.infoValue}>{mobileMoney.mtn}</Text>
                </View>
              )}
              {mobileMoney.airtel && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Airtel:</Text>
                  <Text style={styles.infoValue}>{mobileMoney.airtel}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyText}>Mobile money information will be available soon.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    padding: 16,
    paddingBottom: 88,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 120,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#f1f5f9',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';

interface FamilySupportScreenProps {
  group: string;
  groupLabel: string;
}

interface SupportItem {
  id: string;
  group: string;
  title: string;
  description?: string;
  kind?: string;
  details?: string;
  url?: string;
  sortOrder?: number;
}

const KIND_LABELS: Record<string, string> = {
  bank: 'Bank Transfer',
  mobile: 'Mobile Money',
  link: 'Link',
  info: 'Info',
  other: 'Support',
};

export const FamilySupportScreen: React.FC<FamilySupportScreenProps> = ({ group, groupLabel }) => {
  const navigation = useNavigation();
  const [items, setItems] = useState<SupportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/home/support-items?group=${encodeURIComponent(group)}`);
      const data = await response.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error('Failed to load support items:', error);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [group]);

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={styles.title}>Support {groupLabel}</Text>
        <Text style={styles.subtitle}>Your generous support helps {groupLabel} continue its ministry.</Text>

        {loading ? (
          <Text style={styles.empty}>Loading support options...</Text>
        ) : items.length === 0 ? (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>Support options will be available soon.</Text>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.kindBadge}>
                  <Text style={styles.kindText}>{KIND_LABELS[item.kind || 'other'] || item.kind}</Text>
                </View>
              </View>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              {item.details ? <Text style={styles.details}>{item.details}</Text> : null}
              {item.url ? (
                <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(item.url!)}>
                  <Text style={styles.linkText}>Open Link</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
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
    paddingBottom: 80,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  kindBadge: {
    backgroundColor: '#2735F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  kindText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 8,
  },
  linkButton: {
    backgroundColor: '#2735F5',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  linkText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 40,
  },
});

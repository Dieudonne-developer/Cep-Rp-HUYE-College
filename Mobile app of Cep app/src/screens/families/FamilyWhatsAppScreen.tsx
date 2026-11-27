import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { fetchWhatsAppGroups } from '@/services/userService';

interface FamilyWhatsAppScreenProps {
  group: string;
  groupLabel: string;
}

export const FamilyWhatsAppScreen: React.FC<FamilyWhatsAppScreenProps> = ({ group, groupLabel }) => {
  const navigation = useNavigation();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchWhatsAppGroups();
      setGroups(data || []);
    } catch (error) {
      console.error('Failed to load WhatsApp groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = (link: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => {
        console.error('Failed to open WhatsApp link:', err);
      });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <Text style={styles.title}>{groupLabel} WhatsApp Groups</Text>
      <Text style={styles.subtitle}>Join our WhatsApp groups to stay connected with {groupLabel}.</Text>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {loading ? (
          <Text style={styles.empty}>Loading...</Text>
        ) : groups.length === 0 ? (
          <Text style={styles.empty}>No WhatsApp groups available yet.</Text>
        ) : (
          groups.filter(g => g.slug === group).map((group) => (
            <View key={group._id || group.id || group.name} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{group.name}</Text>
                {group.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {group.description}
                  </Text>
                )}
              </View>
              {(group.inviteUrl) ? (
                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => handleJoin(group.inviteUrl)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.noLinkBadge}>
                  <Text style={styles.noLinkText}>No Link</Text>
                </View>
              )}
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
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  joinButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  joinButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  noLinkBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  noLinkText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
});

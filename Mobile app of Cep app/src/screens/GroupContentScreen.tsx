import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';
import { fetchWhatsAppGroups } from '@/services/userService';

const GROUP_LABELS: Record<string, string> = {
  choir: 'Ishyangaryera Choir',
  anointed: 'Anointed Worship Team',
  abanyamugisha: 'Abanyamugisha Family',
  psalm23: 'Psalm 23 Family',
  psalm46: 'Psalm 46 Family',
  protocol: 'Protocol Family',
  social: 'Social Family',
  evangelical: 'Evangelical Family',
  cepier: 'CEP',
};

interface GroupContentScreenProps {
  group: string;
  onMenuPress: () => void;
}

export const GroupContentScreen: React.FC<GroupContentScreenProps> = ({ group, onMenuPress }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getImageUrl = (activity: any) => {
    const imageUrl = activity.imageUrl || activity.image || activity.image_url;
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const load = async () => {
    try {
      const [a, g] = await Promise.all([
        fetch(`${API_BASE_URL}/api/home/activities`).then(r => r.json()),
        fetchWhatsAppGroups()
      ]);
      setActivities(Array.isArray(a) ? a : []);
      setGroups(g || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [group]);

  if (group === 'cepier') {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={onMenuPress} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
      >
        <View style={styles.headerSection}>
          <Text style={styles.groupTitle}>{GROUP_LABELS[group] || group}</Text>
          <Text style={styles.groupSubtitle}>Welcome to the family page</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Activities</Text>
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : activities.length === 0 ? (
            <Text style={styles.emptyText}>No activities yet.</Text>
          ) : (
            activities.map((activity, index) => {
              const imageUrl = getImageUrl(activity);
              return (
                <View key={index} style={styles.card}>
                  {imageUrl && (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.cardImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{activity.title}</Text>
                    {activity.eventDate && (
                      <Text style={styles.cardMeta}>
                        {new Date(activity.eventDate).toLocaleDateString()}
                      </Text>
                    )}
                    {activity.description && (
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {activity.description}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WhatsApp Groups</Text>
          {groups.length === 0 ? (
            <Text style={styles.emptyText}>No WhatsApp groups available.</Text>
          ) : (
            groups.map((g, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{g.name}</Text>
                {g.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {g.description}
                  </Text>
                )}
              </View>
            ))
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
  content: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  groupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 20,
  },
});

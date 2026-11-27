import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';

interface FamilyActivitiesScreenProps {
  group: string;
  groupLabel: string;
}

type Activity = {
  _id: string;
  title: string;
  description?: string;
  eventDate?: string;
  date?: string;
  eventTime?: string;
  time?: string;
  location?: string;
  imageUrl?: string;
  image?: string;
  status?: string;
};

export const FamilyActivitiesScreen: React.FC<FamilyActivitiesScreenProps> = ({ group, groupLabel }) => {
  const navigation = useNavigation();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const getImageUrl = (activity: any) => {
    const imageUrl = activity.imageUrl || activity.image || activity.image_url;
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/choir/events?group=${group}`);
      const data = await response.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [group]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />
      <Text style={styles.title}>{groupLabel} Activities</Text>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {loading ? (
          <Text style={styles.empty}>Loading...</Text>
        ) : activities.length === 0 ? (
          <Text style={styles.empty}>No activities yet.</Text>
        ) : (
          activities.map((activity) => {
            const imageUrl = getImageUrl(activity);
            return (
              <TouchableOpacity
                key={activity._id}
                style={styles.card}
                onPress={() => setSelectedActivity(activity)}
              >
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{activity.title}</Text>
                  {(activity.eventDate || activity.date) && (
                    <Text style={styles.cardMeta}>
                      {new Date(activity.eventDate || activity.date || Date.now()).toLocaleDateString()}
                    </Text>
                  )}
                  {(activity.eventTime || activity.time) && (
                    <Text style={styles.cardMeta}>{activity.eventTime || activity.time}</Text>
                  )}
                  {activity.location && (
                    <Text style={styles.cardMeta}>📍 {activity.location}</Text>
                  )}
                  {activity.description && (
                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {activity.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedActivity(null)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <ScrollView>
              {getImageUrl(selectedActivity) && (
                <Image
                  source={{ uri: getImageUrl(selectedActivity) }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>{selectedActivity.title}</Text>

                {(selectedActivity.eventDate || selectedActivity.date) && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoLabel}>Date:</Text>
                    <Text style={styles.modalInfoValue}>
                      {new Date(selectedActivity.eventDate || selectedActivity.date || Date.now()).toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {(selectedActivity.eventTime || selectedActivity.time) && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoLabel}>Time:</Text>
                    <Text style={styles.modalInfoValue}>{selectedActivity.eventTime || selectedActivity.time}</Text>
                  </View>
                )}

                {selectedActivity.location && (
                  <View style={styles.modalInfo}>
                    <Text style={styles.modalInfoLabel}>Location:</Text>
                    <Text style={styles.modalInfoValue}>{selectedActivity.location}</Text>
                  </View>
                )}

                {selectedActivity.description && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>About This Event</Text>
                    <Text style={styles.modalDescription}>{selectedActivity.description}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
    paddingBottom: 72,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 60,
  },
  modalInfoValue: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  modalSection: {
    marginTop: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
  },
});

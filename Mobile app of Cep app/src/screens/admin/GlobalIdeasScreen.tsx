import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { fetchGlobalIdeas, implementGlobalIdea, deleteGlobalIdea } from '@/services/adminService';
import { ScreenHeader } from '@/components/ScreenHeader';

export const GlobalIdeasScreen: React.FC = () => {
  const { admin } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const data = await fetchGlobalIdeas(admin);
      setIdeas(data);
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    load();
  }, [load]);

  const handleImplement = (id: string) => {
    Alert.alert('Implement Idea', 'Mark this idea as implemented?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Implement',
        style: 'default',
        onPress: async () => {
          try {
            await implementGlobalIdea(admin!, id);
            load();
            Alert.alert('Success', 'Idea marked as implemented');
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to implement');
          }
        }
      }
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Idea', 'Are you sure you want to delete this idea?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGlobalIdea(admin!, id);
            load();
            Alert.alert('Success', 'Idea deleted');
          } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <ScreenHeader title="Ideas" />
      <Text style={styles.subheading}>Manage ideas submitted for the public homepage</Text>

      <View style={styles.list}>
        {ideas.map((item) => (
          <View key={item._id || item.id} style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.title}>{item.idea}</Text>
              <Text style={styles.subtitle}>
                {item.anonymous ? 'Anonymous' : (item.name || 'Member')}
                {item.implementedDate ? ' • Implemented ' + new Date(item.implementedDate).toLocaleDateString() : ''}
              </Text>
              {item.notes && <Text style={styles.description}>{item.notes}</Text>}
            </View>
            <View style={styles.actions}>
              {!item.implementedDate && (
                <TouchableOpacity
                  style={styles.implementButton}
                  onPress={() => handleImplement(item._id || item.id)}
                >
                  <Text style={styles.implementButtonText}>Implement</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item._id || item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {ideas.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No ideas yet</Text>
            <Text style={styles.emptySubtitle}>Ideas submitted by members will appear here</Text>
          </View>
        )}
      </View>
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
  list: {
    gap: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardContent: {
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4
  },
  description: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  implementButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1
  },
  implementButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
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
  }
});

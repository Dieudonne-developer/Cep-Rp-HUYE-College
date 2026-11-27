import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchIdeas, implementIdea, deleteIdea } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { ScreenHeader } from '@/components/ScreenHeader';

export const IdeasScreen: React.FC = () => {
  const { admin } = useAuth();
  const queryClient = useQueryClient();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['ideas', admin?.adminGroup],
    queryFn: () => fetchIdeas(admin!),
    enabled: !!admin
  });

  const implementMutation = useMutation({
    mutationFn: (id: string) => implementIdea(admin!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas', admin?.adminGroup] });
      Alert.alert('Success', 'Idea marked as implemented');
    },
    onError: (e: any) => {
      Alert.alert('Error', e?.message || 'Failed to implement');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIdea(admin!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas', admin?.adminGroup] });
      Alert.alert('Success', 'Idea deleted');
    },
    onError: (e: any) => {
      Alert.alert('Error', e?.message || 'Failed to delete');
    }
  });

  const handleImplement = (id: string) => {
    Alert.alert('Implement Idea', 'Mark this idea as implemented?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Implement', onPress: () => implementMutation.mutate(id) }
    ]);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Idea', 'Are you sure you want to delete this idea?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
    ]);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      <ScreenHeader title="Ideas" />
      <Text style={styles.subheading}>Track member-submitted ideas and implementation status.</Text>

      {data?.map((idea) => (
        <View key={idea._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{idea.idea}</Text>
              <Text style={styles.cardMeta}>
                Submitted by {idea.submittedBy || idea.email || 'Anonymous'} ·{' '}
                {idea.category || 'General'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                idea.status === 'implemented' ? styles.implemented : styles.pending
              ]}
            >
              <Text style={styles.statusText}>{idea.status ?? 'pending'}</Text>
            </View>
          </View>
          <Text style={styles.cardBody}>{idea.notes || 'No additional notes yet.'}</Text>
          <View style={styles.actions}>
            {idea.status !== 'implemented' && (
              <TouchableOpacity
                style={styles.implementButton}
                onPress={() => handleImplement(idea._id)}
              >
                <Text style={styles.implementButtonText}>Implement</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(idea._id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {(data?.length ?? 0) === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No ideas yet</Text>
          <Text style={styles.emptySubtitle}>Ideas submitted by members will appear here.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a'
  },
  subheading: {
    color: '#475569'
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  cardMeta: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4
  },
  cardBody: {
    color: '#334155'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999
  },
  implemented: {
    backgroundColor: '#dcfce7'
  },
  pending: {
    backgroundColor: '#fee2e2'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
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
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700'
  },
  emptySubtitle: {
    color: '#64748b',
    marginTop: 4
  }
});



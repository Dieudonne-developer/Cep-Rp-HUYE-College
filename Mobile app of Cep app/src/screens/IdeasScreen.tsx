import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchIdeas } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';

export const IdeasScreen: React.FC = () => {
  const { admin } = useAuth();

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['ideas', admin?.adminGroup],
    queryFn: () => fetchIdeas(admin!),
    enabled: !!admin
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      <Text style={styles.heading}>Ideas & Feedback</Text>
      <Text style={styles.subheading}>Track member-submitted ideas and implementation status.</Text>

      {data?.map((idea) => (
        <View key={idea._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{idea.idea}</Text>
            <View
              style={[
                styles.statusBadge,
                idea.status === 'implemented' ? styles.implemented : styles.pending
              ]}
            >
              <Text style={styles.statusText}>{idea.status ?? 'pending'}</Text>
            </View>
          </View>
          <Text style={styles.cardMeta}>
            Submitted by {idea.submittedBy || idea.email || 'Anonymous'} ·{' '}
            {idea.category || 'General'}
          </Text>
          <Text style={styles.cardBody}>{idea.notes || 'No additional notes yet.'}</Text>
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
    gap: 8
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 12
  },
  cardMeta: {
    fontSize: 13,
    color: '#94a3b8'
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



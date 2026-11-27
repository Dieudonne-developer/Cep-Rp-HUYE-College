import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Image, Linking, TouchableOpacity } from 'react-native';
import { API_BASE_URL } from '@/config/api';
import { fetchWhatsAppGroups } from '@/services/userService';

export const ActivitiesScreen: React.FC = () => {
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

  const load = useCallback(async () => {
    try {
      const [a, g] = await Promise.all([
        fetch(`${API_BASE_URL}/api/home/activities`).then(r => r.json()),
        fetchWhatsAppGroups()
      ]);
      setActivities(Array.isArray(a) ? a : []);
      setGroups(g || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activities & Chat</Text>
      <FlatList
        data={activities}
        keyExtractor={(a, i) => String(a._id || a.id || i)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListHeaderComponent={
          <View>
            <Text style={styles.section}>Upcoming Activities</Text>
            {loading && <Text style={styles.empty}>Loading...</Text>}
            {!loading && activities.length === 0 && <Text style={styles.empty}>No activities yet.</Text>}
          </View>
        }
        ListEmptyComponent={null}
        renderItem={({ item }) => {
          const imageUrl = getImageUrl(item);
          return (
            <View style={styles.card}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.img} />
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {(item.eventDate || item.date) ? <Text style={styles.meta}>{new Date(item.eventDate || item.date).toLocaleDateString()}</Text> : null}
                {item.location ? <Text style={styles.meta}>{item.location}</Text> : null}
                {item.description ? <Text style={styles.desc} numberOfLines={3}>{item.description}</Text> : null}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ marginTop: 16 }}>
            <Text style={styles.section}>WhatsApp Groups</Text>
            {groups.map((g: any) => (
              <View key={g._id || g.id || g.name} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{g.name}</Text>
                  {g.description ? <Text style={styles.desc} numberOfLines={2}>{g.description}</Text> : null}
                </View>
                {(g.inviteUrl || g.inviteUrl) ? (
                  <TouchableOpacity onPress={() => Linking.openURL(g.inviteUrl || g.inviteUrl)} style={styles.joinBtn}>
                    <Text style={styles.joinBtnText}>Join</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.noLink}>No link</Text>
                )}
              </View>
            ))}
            {groups.length === 0 && <Text style={styles.empty}>No WhatsApp groups available.</Text>}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 8 },
  section: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 8, marginBottom: 8 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  img: { width: 72, height: 72, borderRadius: 8, marginRight: 10, backgroundColor: '#e2e8f0' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  desc: { fontSize: 12, color: '#475569', marginTop: 4 },
  joinBtn: { backgroundColor: '#16a34a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, justifyContent: 'center' },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  noLink: { fontSize: 11, color: '#94a3b8' },
  empty: { textAlign: 'center', color: '#64748b', marginVertical: 12 },
});

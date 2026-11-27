import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppHeader } from '@/components/AppHeader';
import { API_BASE_URL } from '@/config/api';
import { Feather } from '@expo/vector-icons';

type Song = {
  _id: string;
  title: string;
  url: string;
  mediaType?: 'audio' | 'video';
  description?: string;
  category?: string;
  thumbnail?: string;
  artist?: string;
};

export const AnointedMediaScreen: React.FC = () => {
  const navigation = useNavigation();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all');

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/choir/songs?group=anointed`);
      const data = await response.json();
      setSongs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredSongs = songs.filter(song => {
    if (filter === 'all') return true;
    return song.mediaType === filter;
  });

  const counts = {
    all: songs.length,
    video: songs.filter(s => s.mediaType === 'video').length,
    audio: songs.filter(s => s.mediaType === 'audio').length,
  };

  const handleOpenMedia = (song: Song) => {
    Linking.openURL(song.url).catch(console.error);
  };

  return (
    <View style={styles.container}>
      <AppHeader onMenuPress={() => (navigation as any).openDrawer()} />

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
            All ({counts.all})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'video' && styles.filterButtonActive]}
          onPress={() => setFilter('video')}
        >
          <Text style={[styles.filterButtonText, filter === 'video' && styles.filterButtonTextActive]}>
            Videos ({counts.video})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'audio' && styles.filterButtonActive]}
          onPress={() => setFilter('audio')}
        >
          <Text style={[styles.filterButtonText, filter === 'audio' && styles.filterButtonTextActive]}>
            Audio ({counts.audio})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {loading ? (
          <Text style={styles.empty}>Loading...</Text>
        ) : filteredSongs.length === 0 ? (
          <Text style={styles.empty}>No media available.</Text>
        ) : (
          filteredSongs.map((song) => (
            <View key={song._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIcon}>
                  <Feather
                    name={song.mediaType === 'video' ? 'video' : 'music'}
                    size={20}
                    color="#2735F5"
                  />
                </View>
                <View style={styles.cardHeaderContent}>
                  <Text style={styles.cardTitle}>{song.title}</Text>
                  {song.artist && <Text style={styles.cardArtist}>{song.artist}</Text>}
                </View>
              </View>
              {song.description && (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {song.description}
                </Text>
              )}
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => handleOpenMedia(song)}
              >
                <Feather name={song.mediaType === 'video' ? 'play-circle' : 'play'} size={20} color="#ffffff" />
                <Text style={styles.playButtonText}>
                  {song.mediaType === 'video' ? 'Watch Video' : 'Play Audio'}
                </Text>
              </TouchableOpacity>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2735F5',
    borderColor: '#2735F5',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardArtist: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#2735F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 40,
  },
});
